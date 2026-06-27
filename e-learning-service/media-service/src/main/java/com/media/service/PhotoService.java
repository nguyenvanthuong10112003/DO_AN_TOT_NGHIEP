package com.media.service;

import com.media.dto.PhotoResponse;
import com.media.entity.Photo;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Set;

public interface PhotoService {
    void removePhoto(Set<String> ids);
    List<PhotoResponse> copyPhoto(Set<String> lstPhotoId);
    List<PhotoResponse> uploadPhoto(List<MultipartFile> files, Boolean isTemp);
    Photo loadPhoto(String photoId);
    List<PhotoResponse> activePhoto(Set<String> ids, boolean isHttp);
}
