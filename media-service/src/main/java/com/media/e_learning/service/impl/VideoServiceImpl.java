package com.media.e_learning.service.impl;

import com.media.e_learning.common.Const;
import com.media.e_learning.dto.SessionResponse;
import com.media.e_learning.dto.StreamVideo;
import com.media.e_learning.dto.VideoResponse;
import com.media.e_learning.entity.Photo;
import com.media.e_learning.entity.PhotoData;
import com.media.e_learning.entity.Video;
import com.media.e_learning.helper.DataUtil;
import com.media.e_learning.helper.FileUtil;
import com.media.e_learning.helper.VideoInfo;
import com.media.e_learning.listener.RabbitConsume;
import com.media.e_learning.mapper.VideoMapper;
import com.media.e_learning.repository.VideoRepository;
import com.media.e_learning.service.FfmpegService;
import com.media.e_learning.service.SessionService;
import com.media.e_learning.service.VideoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Slf4j
@Service
public class VideoServiceImpl implements VideoService {
    @Value("${file.upload-dir}")
    private String UPLOAD_DIR;
    @Value("${rabbitmq.message-key.encode-video}")
    private String RABBITMQ_MESSAGE_KEY_ENCODE_VIDEO;
    @Autowired
    private SessionService sessionService;
    @Autowired
    private VideoRepository videoRepository;
    @Autowired
    private TransactionTemplate transactionTemplate;
    private final String VIDEO_FOLDER = "video/";
    @Autowired
    private FfmpegService ffmpegService;
    @Autowired
    private RabbitTemplate rabbitTemplate;
    @Value("${upload-photo.valid-duration}")
    private Long uploadValidDuration;
    @Autowired
    private VideoMapper videoMapper;

    @Override
    public VideoResponse uploadVideo(MultipartFile file, Boolean isTemp) {
        Path path = null;
        try {
            String uploadD = generateTempUploadDir();
            Path uploadDirPath = Paths.get(uploadD);
            if (!Files.exists(uploadDirPath))
                Files.createDirectories(uploadDirPath);

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            path = uploadDirPath.resolve(fileName);
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
            VideoInfo info = null;

            try {
                info = FileUtil.getVideoInfo(path);
            } catch (Exception e) {
                log.error("Error get video info: {}", e.getMessage());
            }

            if (info == null || info.getWidth() == null || info.getHeight() == null)
                throw new RuntimeException("Invalid video file");

            LocalDateTime now = DataUtil.now();
            Video newVideo = Video.builder()
                .uploadBy(SecurityContextHolder.getContext().getAuthentication().getName())
                .fileName(fileName)
                .uploadDatetime(DataUtil.now())
                .status(!DataUtil.boolValue(isTemp))
                .waitExpireAt(DataUtil.boolValue(isTemp) ? now.plusSeconds(uploadValidDuration) : null)
                .activeDatetime(DataUtil.boolValue(isTemp) ? null : now)
                .isActive(!DataUtil.boolValue(isTemp))
                .encodeStatus(Video.EncodeStatus.CREATE)
                .build();

            BeanUtils.copyProperties(info, newVideo);

            videoRepository.save(newVideo);

            if (!isTemp) {
                Message message = new Message(newVideo.getId().getBytes());
                rabbitTemplate.send(RABBITMQ_MESSAGE_KEY_ENCODE_VIDEO, message);
            }

            return videoMapper.toResponse(newVideo);
        } catch (Exception e) {
            log.error(e.getMessage());
            if (path != null) {
                try {
                    Files.deleteIfExists(path);
                } catch (IOException ex) {
                    log.error("Delete file failed", ex);
                }
            }
            throw new RuntimeException(e);
        }
    }

    @Override
    public StreamVideo getVideo(String sessionId, Const.Quality quality, String userId) {
        List<SessionResponse> sessions = DataUtil.defaultIfNull(sessionService.getAllByUser(userId), new ArrayList<>());
        SessionResponse session = sessions.stream()
            .filter(ss -> sessionId.equals(ss.getId()) && DataUtil.now().isBefore(ss.getExpireAt()))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Session not found or expired"));

        Video video = videoRepository.findActiveByIdOrHasNoExpireActive(session.getVideoId())
            .orElseThrow(() -> new RuntimeException("Video not exist"));

        String dir = null;
        if (quality == null) {
            if (Video.EncodeStatus.ENCODED.equals(video.getEncodeStatus()))
                throw new RuntimeException("Required quality: " + video.getQualities());
            dir = generateTempUploadDir();
        } else
            dir = generateUploadDir(quality);
        Path path = Paths.get(dir).resolve(video.getFileName());
        File videoFile = path.toFile();

        if (!videoFile.exists()) throw new RuntimeException("File error");

        return StreamVideo.builder()
            .file(videoFile)
            .sessionExpireAt(session.getExpireAt())
            .build();
    }

    @Override
    public void encodeVideo(String videoId) {
        Video video = videoRepository.findActiveById(videoId)
            .orElseThrow(() -> new RuntimeException("Video not exist"));
        if (Video.EncodeStatus.ENCODING.equals(video.getEncodeStatus())) return;

        // Cập nhật trạng thái
        video.setEncodeStatus(Video.EncodeStatus.ENCODING);
        videoRepository.save(video);

        String videoAbsPath = Paths.get(generateTempUploadDir(), video.getFileName()).toString();

        List<CompletableFuture<EncodeResult>> futures = new ArrayList<>();
        for (Const.Quality quality : Const.Quality.values()) {
            if (quality.getHeight() > video.getHeight()) break;
            futures.add(encodeOneQuality(videoAbsPath, quality, video.getFileName()));
        }

        List<EncodeResult> results = futures.stream()
            .map(CompletableFuture::join)
            .toList();

        List<String> qualities = results.stream()
            .filter(EncodeResult::success)
            .map(rs -> rs.quality.getName()).toList();

        if (qualities.isEmpty()) {
            // Cập nhật trạng thái fail
            video.setEncodeStatus(Video.EncodeStatus.ENCODE_FAIL);
            videoRepository.save(video);
            throw new RuntimeException("Cannot encode any quality");
        }

        // Cập nhật trạng thái success
        video.setEncodeStatus(Video.EncodeStatus.ENCODED);
        video.setQualities(String.join(",", qualities));
        videoRepository.save(video);

        try {
            Files.deleteIfExists(Paths.get(videoAbsPath));
        } catch (IOException ex) {
            log.error("Delete file failed", ex);
        }

        log.info("Encode video hoàn tất: {}", String.join(",", qualities));
    }

    private CompletableFuture<EncodeResult> encodeOneQuality(String videoAbsPath, Const.Quality quality, String fileName) {

        return CompletableFuture.supplyAsync(() -> {
            try {
                log.info("Encode video to {} bắt đầu", quality);

                // Xây dựng đường dẫn output
                String outputDir = generateUploadDir(quality);
                ensureDir(outputDir);

                String outputFilePath = Paths.get(outputDir, fileName).toString();

                // Thực hiện encode
                long fileSize = ffmpegService.encodeToMp4(videoAbsPath, outputFilePath, quality);

                log.info("Encode video to {} hoàn tất ({} bytes)", quality, fileSize);
                return new EncodeResult(quality, true, null);

            } catch (Exception e) {
                log.error("Encode video to {} thất bại: {}", quality, e.getMessage());
                return new EncodeResult(quality, false, e.getMessage());
            }
        });
    }

    private void ensureDir(String dir) {
        try {
            java.nio.file.Files.createDirectories(Paths.get(dir));
        } catch (Exception e) {
            throw new RuntimeException("Không tạo được thư mục: " + dir, e);
        }
    }


    private String generateTempUploadDir() {
        return Paths.get(UPLOAD_DIR, VIDEO_FOLDER, "/temp/").toAbsolutePath().toString();
    }

    private String generateUploadDir(Const.Quality quality) {
        return Paths.get(UPLOAD_DIR, VIDEO_FOLDER, quality.getName().toLowerCase()).toAbsolutePath().toString();
    }

    private String generateThumbnailDir() {
        return Paths.get(UPLOAD_DIR, VIDEO_FOLDER, "/thumbnail/").toAbsolutePath().toString();
    }

    private record EncodeResult(Const.Quality quality, boolean success, String errorMessage) {}
}
