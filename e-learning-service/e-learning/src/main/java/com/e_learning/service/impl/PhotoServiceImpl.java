package com.e_learning.service.impl;

import com.e_learning.client.MediaServiceClient;
import com.e_learning.common.Const;
import com.e_learning.dto.PhotoDTO;
import com.e_learning.dto.listener.ActivePhotoRequest;
import com.e_learning.dto.listener.RemovePhotoRequest;
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

        ResponseEntity<ResponseApi<List<PhotoDTO>>> uploadPhotoResponse =
            mediaServiceClient.uploadPhoto(createHeader(accessToken), files, false);

        if (!uploadPhotoResponse.getStatusCode().equals(HttpStatus.OK) ||
            uploadPhotoResponse.getBody() == null ||
            DataUtil.isNullOrEmpty(uploadPhotoResponse.getBody().getData()))
            return new ArrayList<>();

        List<PhotoDTO> lstPhotoDTO = uploadPhotoResponse.getBody().getData();
        return photoRepository.saveAll(photoMapper.toLstEntity(lstPhotoDTO).stream()
            .toList());
    }

    @Override
    @Transactional
    public void removePhoto(List<Photo> photos) {
        if (DataUtil.isNullOrEmpty(photos)) return;
        List<String> ids = photos.stream().map(Photo::getId).toList();
        photoRepository.deleteAll(photos);
        rabbitTemplate.convertAndSend(RABBITMQ_MESSAGE_KEY_REMOVE_PHOTO, new RemovePhotoRequest(ids));
    }

    @Override
    public void removePhotoById(List<String> ids) {
        if (DataUtil.isNullOrEmpty(ids)) return;
        List<Photo> photos = photoRepository.findAllByStatusAndIdIn(Const.STATUS_ACTIVE, ids);
        if (DataUtil.isNullOrEmpty(photos)) return;
        List<String> removed = new ArrayList<>();
        for (Photo photo : photos)
            try {
                String id = photo.getId();
                photoRepository.delete(photo);
                removed.add(id);
            } catch (Exception ignored) {}
        rabbitTemplate.convertAndSend(RABBITMQ_MESSAGE_KEY_REMOVE_PHOTO, new RemovePhotoRequest(removed));
    }

    @Override
    @Transactional
    public List<Photo> activePhoto(List<String> ids, String accessToken) {
        if (DataUtil.isNullOrEmpty(ids)) return new ArrayList<>();
        List<Photo> actives = DataUtil.defaultIfNull(photoRepository.findAllByStatusAndIsActiveAndIdIn(Const.STATUS_ACTIVE, true, ids), new ArrayList<>());
        if (actives.size() == ids.size()) return actives;
        Set<String> idActive = actives.stream().map(Photo::getId).collect(Collectors.toSet());
        ids = ids.stream().filter(id -> !idActive.contains(id)).toList();
        try {
            ResponseEntity<ResponseApi<List<PhotoDTO>>> uploadPhotoResponse =
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

    @Override
    @Transactional
    public void activePhoto(List<String> ids) {
        if (DataUtil.isNullOrEmpty(ids)) return;

        List<Photo> photos = photoRepository.findAllByStatusAndIdIn(Const.STATUS_ACTIVE, ids);

        if (DataUtil.isNullOrEmpty(photos)) return;

        Object response = rabbitTemplate.convertSendAndReceive(
            RABBITMQ_MESSAGE_KEY_ACTIVE_PHOTO,
            new ActivePhotoRequest(photos.stream().map(Photo::getId).toList())
        );

        if (!(response instanceof List<?>)) {
            throw new RuntimeException("RabbitMQ timeout");
        }

        Set<String> idActives = new HashSet<>((List<String>) response);

        if (!DataUtil.isNullOrEmpty(idActives)) {
            photoRepository.saveAll(photos.stream().filter(photo -> idActives.contains(photo.getId())).peek(photo -> {
                photo.setIsActive(true);
            }).toList());
        }
    }

    private Map<String, String> createHeader(String accessToken) {
        Map<String, String> headers = new HashMap<>();
        headers.put("Authorization", "Bearer " + accessToken);
        return headers;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveIfNotExist(List<Photo> photos) {
        if (DataUtil.isNullOrEmpty(photos)) return;
        Set<String> photoExists = new HashSet<>(photoRepository.findAllIdExists(new ArrayList<>(photos.stream().map(Photo::getId).toList())));
        List<Photo> saves = photos.stream().filter(photo -> !photoExists.contains(photo.getId())).toList();
        photoRepository.saveAll(saves);
    }

}
