package com.media.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.media.service.RedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.logging.log4j.util.Strings;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class RedisServiceImpl implements RedisService {
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public void set(String key, Object value, long timeSave, TimeUnit timeUnit) {
        if (Strings.isEmpty(key))
            throw new IllegalArgumentException("Key is required");

        try {
            redisTemplate.opsForValue().set(key, objectMapper.writeValueAsString(value), timeSave, timeUnit);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Cannot parse to json", e);
        }
    }

    @Override
    public void set(String key, Object value) {
        if (Strings.isEmpty(key))
            throw new IllegalArgumentException("Key is required");

        try {
            redisTemplate.opsForValue().set(key, objectMapper.writeValueAsString(value));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Cannot parse to json", e);
        }
    }

    @Override
    public <T> T get(String key, TypeReference<T> type) {
        if (type == null) return null;

        String value = String.valueOf(redisTemplate.opsForValue().get(key));
        if (value == null) return null;

        try {
            return objectMapper.readValue(value, type);
        } catch (Exception e) {
            throw new RuntimeException("Deserialize error", e);
        }
    }
}
