package com.media.e_learning.listener;

import com.media.e_learning.service.PhotoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
public class RabbitConsume {
    @Autowired
    private PhotoService photoService;

    @RabbitListener(id = "remove-photo-consumer",
        queues = "${rabbitmq.message-key.remove-photo}")
    public void listenerRemovePhoto(List<String> ids, @Header(AmqpHeaders.CONSUMER_QUEUE) String queue) {
        try {
            photoService.removePhoto(ids, true);
        } catch (Exception e) {
            log.error("Listener remove photo: {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }
}