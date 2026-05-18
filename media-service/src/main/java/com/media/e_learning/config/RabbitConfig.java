package com.media.e_learning.config;

import com.media.e_learning.entity.RabbitMQLog;
import com.media.e_learning.helper.DataUtil;
import com.media.e_learning.repository.RabbitMQLogRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.AmqpRejectAndDontRequeueException;
import org.springframework.amqp.core.MessageProperties;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.config.RetryInterceptorBuilder;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.stream.Collectors;

@Slf4j
@Configuration
public class RabbitConfig {
    @Value("${rabbitmq.message-key.remove-photo}")
    private String RABBITMQ_MESSAGE_KEY_REMOVE_PHOTO;
    @Value("${rabbitmq.message-key.encode-video}")
    private String RABBITMQ_MESSAGE_KEY_ENCODE_VIDEO;
    @Value("${rabbitmq.message-key.active-photo}")
    private String CONSUMER_MESSAGE_KEY_ACTIVE_PHOTO;
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
    public Queue encodeVideoQueue() {
        return new Queue(RABBITMQ_MESSAGE_KEY_ENCODE_VIDEO);
    }
    @Bean
    public Queue activePhotoQueue() {
        return new Queue(CONSUMER_MESSAGE_KEY_ACTIVE_PHOTO);
    }
    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory, MessageConverter converter) {

        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(converter);
        factory.setAdviceChain(
            RetryInterceptorBuilder.stateless()
                .maxAttempts(CONSUMER_RETRY_NUM) // thử lại 10 lần
                .backOffOptions(1000, 2.0, 10000)
                .recoverer((message, cause) -> {
                    MessageProperties properties = message.getMessageProperties();
                    String body = new String(message.getBody(), StandardCharsets.UTF_8);
                    log.error(cause.getMessage());
                    RabbitMQLog log = RabbitMQLog.builder()
                        .consumer(properties.getConsumerQueue())
                        .body(body)
                        .errorMessage(cause.getMessage())
                        .createdTime(DataUtil.now())
                        .retryNum(CONSUMER_RETRY_NUM.longValue())
                        .build();
                    rabbitMQLogRepository.save(log);

                    throw new AmqpRejectAndDontRequeueException(cause);
                })
                .build()
        );

        // số consumer tối thiểu
        factory.setConcurrentConsumers(1);

        // tối đa
        factory.setMaxConcurrentConsumers(10);

        return factory;
    }

    @Bean
    public RabbitTemplate rabbitTemplate(
            ConnectionFactory connectionFactory,
            MessageConverter messageConverter
    ) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter);
        return template;
    }
}
