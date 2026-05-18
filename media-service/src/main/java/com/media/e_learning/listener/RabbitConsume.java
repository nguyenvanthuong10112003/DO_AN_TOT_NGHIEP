package com.media.e_learning.listener;

import com.media.e_learning.dto.ConsumeRequest;
import com.media.e_learning.dto.RemovePhotoRequest;
import com.media.e_learning.service.PhotoService;
import com.media.e_learning.service.VideoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
public class RabbitConsume {
    @Autowired
    private PhotoService photoService;
    @Autowired
    private VideoService videoService;

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
    public void listenerEncodeVideo(String videoId, @Header(AmqpHeaders.CONSUMER_QUEUE) String queue) {
        try {
            videoService.encodeVideo(videoId);
            log.info("Encoded video: {}", videoId);
        } catch (Exception e) {
            log.error("Listener encode video: {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }
}