package com.media.e_learning.service.impl;

import com.luciad.imageio.webp.WebPWriteParam;
import com.media.e_learning.dto.PhotoResponse;
import com.media.e_learning.entity.Photo;
import com.media.e_learning.entity.PhotoData;
import com.media.e_learning.helper.DataUtil;
import com.media.e_learning.mapper.PhotoMapper;
import com.media.e_learning.repository.PhotoRepository;
import com.media.e_learning.service.PhotoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.FileImageOutputStream;
import javax.imageio.stream.ImageOutputStream;
import javax.imageio.stream.MemoryCacheImageOutputStream;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class PhotoServiceImpl implements PhotoService {
    @Value("${upload-photo.valid-duration}")
    private Long uploadValidDuration;
    private final PhotoRepository repo;
    @Autowired
    private PhotoMapper photoMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<PhotoResponse> uploadPhoto(List<MultipartFile> files, Boolean isTemp) {
        if (files.size() > 10)
            throw new RuntimeException("Maximum upload 10 files in a request");
        String userId = getCurrentUserId();
        LocalDateTime now = DataUtil.now();
        List<Photo> photos = new ArrayList<>();
        for (MultipartFile file : files) {
            try {
                photos.add(Photo.builder()
                    .uploadBy(userId)
                    .uploadDatetime(now)
                    .status(!DataUtil.boolValue(isTemp))
                    .waitExpireAt(DataUtil.boolValue(isTemp) ? now.plusSeconds(uploadValidDuration) : null)
                    .activeDatetime(DataUtil.boolValue(isTemp) ? null : now)
                    .isActive(!DataUtil.boolValue(isTemp))
                    .data(PhotoData.builder()
                        .fileName(file.getOriginalFilename())
                        .contentType("image/webp")
                        .data(compressToWebp(file))
                        .status(true)
                        .uploadBy(userId)
                        .uploadDatetime(now)
                        .build())
                    .build());
            } catch (IOException e) {
                log.error("Cannot upload image: {}, detail message: {}", file.getName(), e.getMessage());
            }
        }
        repo.saveAll(photos);
        return photoMapper.toListResponse(photos);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<PhotoResponse> activePhoto(Set<String> ids) {
        List<Photo> photos = repo.findActiveOrHasNoExpireActiveByIds(new ArrayList<>(ids));
        String userId = requiredCurrentUserId();
        LocalDateTime now = DataUtil.now();
        if (photos == null || photos.isEmpty()) return List.of();
        photos = photos.stream().filter(photo -> userId.equals(photo.getUploadBy())).peek(photo -> {
            photo.setStatus(true);
            photo.setActiveDatetime(now);
            photo.setIsActive(true);
        }).toList();
        return photoMapper.toListResponse(repo.saveAll(photos));
    }

    private byte[] compressToPng(MultipartFile file) throws IOException {
        log.info("Nén ảnh from: {} bytes", file.getSize());

        BufferedImage image = ImageIO.read(file.getInputStream());
        if (image == null) throw new IOException("Cannot read image");

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ImageIO.write(image, "png", outputStream);

        log.info("To: {} bytes", outputStream.size());
        return outputStream.toByteArray();
    }

    private byte[] compressToWebp(MultipartFile file) throws IOException {
        log.info("Compress image from: {} bytes", file.getSize());

        BufferedImage image = ImageIO.read(file.getInputStream());

        ImageWriter writer = ImageIO
            .getImageWritersByMIMEType("image/webp")
            .next();

        WebPWriteParam params = new WebPWriteParam(writer.getLocale());
        params.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
        params.setCompressionType(
                params.getCompressionTypes()[WebPWriteParam.LOSSY_COMPRESSION]
        );

        params.setCompressionQuality(0.9f);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try (ImageOutputStream imageOutputStream =
                     new MemoryCacheImageOutputStream(outputStream)) {
            writer.setOutput(imageOutputStream);
            writer.write(
                null,
                new IIOImage(image, null, null),
                params
            );
            writer.dispose();
        }

        byte[] result = outputStream.toByteArray();
        log.info("Compressed to: {} bytes", result.length);
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void removePhoto(Set<String> ids) {
        List<Photo> photos = repo.findActiveOrHasNoExpireActiveByIds(new ArrayList<>(ids));
        if (photos == null || photos.isEmpty()) return;
        repo.deleteAll(photos);
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public List<PhotoResponse> copyPhoto(Set<String> lstPhotoId) {
        List<Photo> photos = repo.findActiveByIds(new ArrayList<>(lstPhotoId));
        if (photos == null || photos.isEmpty()) return List.of();
        String userId = getCurrentUserId();
        LocalDateTime now = DataUtil.now();
        return photoMapper.toListResponse(repo.saveAll(photos.stream().map(photo -> {
            Photo newPhoto = photoMapper.clone(photo);
            newPhoto.setRootId(photo.getId());
            newPhoto.setId(null);
            newPhoto.setUploadBy(userId);
            newPhoto.setUploadDatetime(now);
            newPhoto.setActiveDatetime(now);
            if (photo.getData() != null) {
                PhotoData photoData = photoMapper.clone(photo.getData());
                photoData.setId(null);
                photoData.setUploadBy(userId);
                photoData.setUploadDatetime(now);
                newPhoto.setData(photoData);
            }
            return newPhoto;
        }).toList()));
    }

    @Override
    public Photo loadPhoto(String id) {
        return repo.findActiveByIdOrHasNoExpireActive(id)
            .orElseThrow(() -> new RuntimeException("Photo not exist"));
    }

    private String getCurrentUserId() {
        try {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        } catch (Exception ignored) {}
        return null;
    }

    private String requiredCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}