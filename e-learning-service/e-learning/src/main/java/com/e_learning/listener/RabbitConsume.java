package com.e_learning.listener;

import com.e_learning.dto.listener.ActivePhotoRequest;
import com.e_learning.dto.listener.RemovePhotoRequest;
import com.e_learning.service.PhotoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import java.util.HashSet;

@Slf4j
@Component
public class RabbitConsume {
    @Autowired
    private PhotoService photoService;

    @RabbitListener(id = "active-client-photo-consumer",
            queues = "${rabbitmq.message-key.active-client-photo}")
    public void listenerActiveClientPhoto(ActivePhotoRequest request, @Header(AmqpHeaders.CONSUMER_QUEUE) String queue) {
        try {
            photoService.activePhoto(request.getIds());
            log.info("Active client photo: {}", String.join(", ", request.getIds()));
        } catch (Exception e) {
            log.error("Listener active client photo: {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @RabbitListener(id = "remove-client-photo-consumer",
            queues = "${rabbitmq.message-key.remove-client-photo}")
    public void listenerRemovePhoto(RemovePhotoRequest request, @Header(AmqpHeaders.CONSUMER_QUEUE) String queue) {
        try {
            photoService.removePhotoById(request.getIds());
            log.info("Remove client photo: {}", String.join(", ", request.getIds()));
        } catch (Exception e) {
            log.error("Listener remove client photo: {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }
}
