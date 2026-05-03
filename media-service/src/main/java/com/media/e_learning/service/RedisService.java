package com.media.e_learning.service;

import com.fasterxml.jackson.core.type.TypeReference;

import java.time.temporal.TemporalUnit;
import java.util.concurrent.TimeUnit;

public interface RedisService {
    void set(String key, Object value);
    void set(String key, Object value, long timeSave, TimeUnit timeUnit);
    <T> T get(String key, TypeReference<T> type);
}
