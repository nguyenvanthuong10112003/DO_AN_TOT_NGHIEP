package com.media.e_learning.service;

import com.media.e_learning.dto.PhotoResponse;
import com.media.e_learning.entity.Photo;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Set;

public interface PhotoService {
    void removePhoto(List<String> ids);
    List<PhotoResponse> copyPhoto(List<String> lstPhotoId);
    List<PhotoResponse> uploadPhoto(List<MultipartFile> files, Boolean isTemp);
    Photo loadPhoto(String photoId);
    List<PhotoResponse> activePhoto(Set<String> ids);
}
