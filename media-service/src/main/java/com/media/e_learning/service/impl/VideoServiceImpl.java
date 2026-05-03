package com.media.e_learning.service.impl;

import com.media.e_learning.dto.SessionResponse;
import com.media.e_learning.dto.VideoResponse;
import com.media.e_learning.entity.Video;
import com.media.e_learning.helper.DataUtil;
import com.media.e_learning.repository.VideoRepository;
import com.media.e_learning.service.SessionService;
import com.media.e_learning.service.VideoService;
import lombok.extern.slf4j.Slf4j;
import org.apache.logging.log4j.util.Strings;
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
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class VideoServiceImpl implements VideoService {
    @Value("${file.upload-dir}")
    private String uploadDir;
    @Autowired
    private SessionService sessionService;
    @Autowired
    private VideoRepository videoRepository;
    @Autowired
    private TransactionTemplate transactionTemplate;
    @Override
    @Transactional(rollbackFor = Exception.class)
    public VideoResponse uploadVideo(String name, MultipartFile file) {
        if (Strings.isBlank(name))
            throw new RuntimeException("Name video is required");
        if (file == null || file.isEmpty())
            throw new RuntimeException("File is required");
        if (file.getContentType() == null || !file.getContentType().startsWith("video/"))
            throw new RuntimeException("File must be a video");
        Path path = null;
        try {
            Path uploadDirPath = Paths.get(uploadDir);
            if (!Files.exists(uploadDirPath))
                Files.createDirectories(uploadDirPath);

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            path = uploadDirPath.resolve(fileName);
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

            Video newVideo = Video.builder()
                .name(name)
                .uploadBy(SecurityContextHolder.getContext().getAuthentication().getName())
                .fileName(fileName)
                .location(uploadDir)
                .uploadDatetime(DataUtil.now())
                .status(true)
                .build();

            videoRepository.save(newVideo);

            return VideoResponse.builder()
                .name(name)
                .url(path.toUri().getPath())
                .build();
        } catch (Exception e) {
            log.error(e.getMessage());
            if (path != null) {
                try {
                    Files.deleteIfExists(path);
                } catch (IOException ex) {
                    log.error("Delete file failed", ex);
                }
            }
            throw new RuntimeException("Upload failed");
        }
    }

    @Override
    public File getVideo(String sessionId, String userId) {
        List<SessionResponse> sessions = DataUtil.defaultIfNull(sessionService.getAllByUser(userId), new ArrayList<>());
        SessionResponse session = sessions.stream()
            .filter(ss -> sessionId.equals(ss.getId()) && DataUtil.now().isBefore(ss.getExpireAt()))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Session not found or expired"));

        Video video = videoRepository.findById(session.getVideoId())
            .orElseThrow(() -> new RuntimeException("Video not exist"));

        Path path = Paths.get(video.getLocation()).resolve(video.getFileName());
        File videoFile = path.toFile();

        if (!videoFile.exists()) throw new RuntimeException("File error");

        return videoFile;
    }
}
