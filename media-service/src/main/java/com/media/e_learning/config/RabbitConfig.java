package com.media.e_learning.config;

import com.media.e_learning.entity.RabbitMQLog;
import com.media.e_learning.helper.DataUtil;
import com.media.e_learning.repository.RabbitMQLogRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.MessageProperties;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.config.RetryInterceptorBuilder;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.nio.charset.StandardCharsets;

@Slf4j
@Configuration
public class RabbitConfig {
    @Value("${rabbitmq.message-key.remove-photo}")
    private String RABBITMQ_MESSAGE_KEY_REMOVE_PHOTO;
    @Value("${rabbitmq.consume.retry-num}")
    private Integer CONSUMER_RETRY_NUM;
    @Autowired
    private RabbitMQLogRepository rabbitMQLogRepository;
    @Bean
    public MessageConverter converter() {
        return new Jackson2JsonMessageConverter();
    }
    @Bean
    public Queue removePhotoQueue() {
        return new Queue(RABBITMQ_MESSAGE_KEY_REMOVE_PHOTO);
    }
    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory, MessageConverter converter) {

        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);

        factory.setAdviceChain(
            RetryInterceptorBuilder.stateless()
                .maxAttempts(CONSUMER_RETRY_NUM) // thử lại 10 lần
                .recoverer((message, cause) -> {
                    MessageProperties properties = message.getMessageProperties();
                    String body = new String(message.getBody(), StandardCharsets.UTF_8);
                    RabbitMQLog log = RabbitMQLog.builder()
                        .consumer(properties.getConsumerQueue())
                        .body(body)
                        .errorMessage(cause.getMessage())
                        .createdTime(DataUtil.now())
                        .retryNum(CONSUMER_RETRY_NUM.longValue())
                        .build();
                    rabbitMQLogRepository.save(log);
                })
                .build()
        );

        return factory;
    }
}
