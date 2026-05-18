package com.e_learning.service;

import com.e_learning.entity.Photo;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PhotoService {
    List<Photo> uploadPhoto(List<MultipartFile> files, Boolean isTemp, String uploadBy, String accessToken);
    void removePhoto(List<Photo> photos, String accessToken);
    List<Photo> activePhoto(List<String> ids, String accessToken);
}
