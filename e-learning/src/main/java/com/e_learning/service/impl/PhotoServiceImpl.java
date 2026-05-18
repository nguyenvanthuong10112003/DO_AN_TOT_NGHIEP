package com.e_learning.service.impl;

import com.e_learning.client.MediaServiceClient;
import com.e_learning.common.Const;
import com.e_learning.dto.request.ConsumeRequest;
import com.e_learning.dto.request.RemovePhotoRequest;
import com.e_learning.dto.response.PhotoResponse;
import com.e_learning.dto.response.ResponseApi;
import com.e_learning.entity.Photo;
import com.e_learning.helper.DataUtil;
import com.e_learning.mapper.PhotoMapper;
import com.e_learning.repository.PhotoRepository;
import com.e_learning.service.PhotoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class PhotoServiceImpl implements PhotoService {
    @Autowired
    private MediaServiceClient mediaServiceClient;
    @Autowired
    private PhotoMapper photoMapper;
    @Autowired
    private PhotoRepository photoRepository;
    @Value("${rabbitmq.message-key.remove-photo}")
    private String RABBITMQ_MESSAGE_KEY_REMOVE_PHOTO;
    @Value("${rabbitmq.message-key.active-photo}")
    private String RABBITMQ_MESSAGE_KEY_ACTIVE_PHOTO;
    @Autowired
    private RabbitTemplate rabbitTemplate;
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
        List<String> ids = photos.stream().map(Photo::getId).toList();
        photoRepository.deleteAll(photos);
        rabbitTemplate.convertAndSend(RABBITMQ_MESSAGE_KEY_REMOVE_PHOTO, new RemovePhotoRequest(ids));
    }

    @Override
    public List<Photo> activePhoto(List<String> ids, String accessToken) {
        if (DataUtil.isNullOrEmpty(ids)) return new ArrayList<>();
        List<Photo> actives = DataUtil.defaultIfNull(photoRepository.findAllByStatusAndIsActiveAndIdIn(Const.STATUS_ACTIVE, true, ids), new ArrayList<>());
        if (actives.size() == ids.size()) return actives;
        Set<String> idActive = actives.stream().map(Photo::getId).collect(Collectors.toSet());
        ids = ids.stream().filter(id -> !idActive.contains(id)).toList();
        try {
            ResponseEntity<ResponseApi<List<PhotoResponse>>> uploadPhotoResponse =
                    mediaServiceClient.activePhoto(createHeader(accessToken), new HashSet<>(ids));

            if (!uploadPhotoResponse.getStatusCode().equals(HttpStatus.OK) ||
                    uploadPhotoResponse.getBody() == null ||
                    DataUtil.isNullOrEmpty(uploadPhotoResponse.getBody().getData()))
                return new ArrayList<>();

            actives.addAll(photoRepository.saveAll(photoMapper.toLstEntity(uploadPhotoResponse.getBody().getData()).stream()
                    .toList()));
        } catch (Exception e) {
            log.error("Active ảnh thất bại: {}", e.getMessage());
            e.printStackTrace();
        }
        return actives;
    }

    private Map<String, String> createHeader(String accessToken) {
        Map<String, String> headers = new HashMap<>();
        headers.put("Authorization", "Bearer " + accessToken);
        return headers;
    }
}
