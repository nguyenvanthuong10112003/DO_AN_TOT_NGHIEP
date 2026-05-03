package com.e_learning.service.impl;

import com.e_learning.client.MediaServiceClient;
import com.e_learning.dto.response.PhotoResponse;
import com.e_learning.dto.response.ResponseApi;
import com.e_learning.entity.Photo;
import com.e_learning.helper.DataUtil;
import com.e_learning.mapper.PhotoMapper;
import com.e_learning.repository.PhotoRepository;
import com.e_learning.service.PhotoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class PhotoServiceImpl implements PhotoService {
    @Autowired
    private MediaServiceClient mediaServiceClient;
    @Autowired
    private PhotoMapper photoMapper;
    @Autowired
    private PhotoRepository photoRepository;
    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<Photo> uploadPhoto(List<MultipartFile> files, Boolean isTemp, String uploadBy, String accessToken) {

        ResponseEntity<ResponseApi<List<PhotoResponse>>> uploadPhotoResponse =
            mediaServiceClient.uploadPhoto(createHeader(accessToken), files, false);

        if (!uploadPhotoResponse.getStatusCode().equals(HttpStatus.OK) ||
            uploadPhotoResponse.getBody() == null ||
            DataUtil.isNullOrEmpty(uploadPhotoResponse.getBody().getData()))
            return new ArrayList<>();

        List<PhotoResponse> lstPhotoResponse = uploadPhotoResponse.getBody().getData();
        return photoRepository.saveAll(photoMapper.toLstEntity(lstPhotoResponse).stream()
            .toList());
    }

    @Override
    public void removePhoto(List<Photo> photos, String accessToken) {
        try {
            mediaServiceClient.removePhoto(createHeader(accessToken), photos.stream().map(Photo::getId).toList());
        } catch (Exception e) {
            log.error("Xóa ảnh thất bại: {}", e.getMessage());
            e.printStackTrace();
        }
        photoRepository.deleteAll(photos);
    }

    @Override
    public List<Photo> active(List<String> ids, String accessToken) {
        if (DataUtil.isNullOrEmpty(ids)) return new ArrayList<>();
        try {
            ResponseEntity<ResponseApi<List<PhotoResponse>>> uploadPhotoResponse =
                mediaServiceClient.activePhoto(createHeader(accessToken), ids);

            if (!uploadPhotoResponse.getStatusCode().equals(HttpStatus.OK) ||
                uploadPhotoResponse.getBody() == null ||
                DataUtil.isNullOrEmpty(uploadPhotoResponse.getBody().getData()))
                return new ArrayList<>();

            return photoRepository.saveAll(photoMapper.toLstEntity(uploadPhotoResponse.getBody().getData()).stream()
                .toList());
        } catch (Exception e) {
            log.error("Active ảnh thất bại: {}", e.getMessage());
            e.printStackTrace();
        }
        return new ArrayList<>();
    }

    private Map<String, String> createHeader(String accessToken) {
        Map<String, String> headers = new HashMap<>();
        headers.put("Authorization", "Bearer " + accessToken);
        return headers;
    }
}
