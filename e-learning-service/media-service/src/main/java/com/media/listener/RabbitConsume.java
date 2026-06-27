package com.media.listener;

import com.media.dto.*;
import com.media.dto.*;
import com.media.service.PhotoService;
import com.media.service.VideoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;

@Slf4j
@Component
public class RabbitConsume {
    @Autowired
    private PhotoService photoService;
    @Autowired
    private VideoService videoService;

    @RabbitListener(id = "active-photo-consumer",
            queues = "${rabbitmq.message-key.active-photo}")
    public List<String> listenerActivePhoto(ActivePhotoRequest request, @Header(AmqpHeaders.CONSUMER_QUEUE) String queue) {
        try {
            List<PhotoResponse> responses = photoService.activePhoto(new HashSet<String>(request.getIds()), false);
            log.info("Active photo: {}", String.join(", ", request.getIds()));
            return responses.stream().map(PhotoResponse::getId).toList();
        } catch (Exception e) {
            log.error("Listener active photo: {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @RabbitListener(id = "remove-photo-consumer",
        queues = "${rabbitmq.message-key.remove-photo}")
    public void listenerRemovePhoto(RemovePhotoRequest request, @Header(AmqpHeaders.CONSUMER_QUEUE) String queue) {
        try {
            photoService.removePhoto(new HashSet<String>(request.getIds()));
            log.info("Remove photo: {}", String.join(", ", request.getIds()));
        } catch (Exception e) {
            log.error("Listener remove photo: {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @RabbitListener(id = "encode-video-consumer",
        queues = "${rabbitmq.message-key.encode-video}")
    public void listenerEncodeVideo(EncodeVideoRequest request, @Header(AmqpHeaders.CONSUMER_QUEUE) String queue) {
        try {
            videoService.encodeVideo(request.getId());
            log.info("Encoded video: {}", request.getId());
        } catch (Exception e) {
            log.error("Listener encode video: {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @RabbitListener(id = "active-video-consumer",
            queues = "${rabbitmq.message-key.active-video}")
    public void listenerActiveVideo(ActiveVideoRequest request, @Header(AmqpHeaders.CONSUMER_QUEUE) String queue) {
        try {
            videoService.activeVideo(new HashSet<String>(request.getIds()));
            log.info("Active video: {}", String.join(", ", request.getIds()));
        } catch (Exception e) {
            log.error("Listener active video: {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @RabbitListener(id = "remove-video-consumer",
            queues = "${rabbitmq.message-key.remove-video}")
    public void listenerRemoveVideo(RemoveVideoRequest request, @Header(AmqpHeaders.CONSUMER_QUEUE) String queue) {
        try {
            videoService.removeVideo(new HashSet<String>(request.getIds()));
            log.info("Remove video: {}", String.join(", ", request.getIds()));
        } catch (Exception e) {
            log.error("Listener remove video: {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }
}