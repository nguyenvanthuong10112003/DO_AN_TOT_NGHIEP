package com.media.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.media.dto.SessionCreateRequest;
import com.media.dto.SessionResponse;
import com.media.exception.AppException;
import com.media.exception.ErrorCode;
import com.media.helper.DataUtil;
import com.media.repository.VideoRepository;
import com.media.service.RedisService;
import com.media.service.SessionService;
import lombok.extern.slf4j.Slf4j;
import org.apache.logging.log4j.util.Strings;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class SessionServiceImpl implements SessionService {
    private static final String BASE_SESSION_KEY = "SESSION_KEY";
    @Autowired
    private ObjectMapper objectMapper;
    @Value("${redis.session.time-save}")
    private Long timeSave;
    @Autowired
    private RedisService redisService;
    @Autowired
    private VideoRepository videoRepository;

    @Override
    public SessionResponse createSession(SessionCreateRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        if (Strings.isBlank(userId)) throw new AppException(ErrorCode.UNAUTHENTICATED);
        if (request == null) throw new RuntimeException("Request body is required");
        if (Strings.isBlank(request.getVideoId())) throw new RuntimeException("Video id is required");

        if (videoRepository.findActiveByIdOrHasNoExpireActive(request.getVideoId()).isEmpty())
            throw new RuntimeException("Video not exist");

        List<SessionResponse> sessionsOfUser = getAllByUser(userId);
        if (sessionsOfUser == null) sessionsOfUser = new ArrayList<>();

        LocalDateTime now = DataUtil.now();
        SessionResponse session = sessionsOfUser.stream()
            .filter(ss -> request.getVideoId().equals(ss.getVideoId()) && now.isBefore(ss.getExpireAt()))
            .findFirst()
            .orElse(null);

        if (session != null) return session;
        session = SessionResponse.builder()
            .id(UUID.randomUUID().toString().substring(0, 10))
            .createAt(now)
            .createBy(userId)
            .expireAt(now.plusSeconds(timeSave))
            .videoId(request.getVideoId())
            .build();

        sessionsOfUser.add(session);
        String key = generateRedisKey(userId);
        redisService.set(key, sessionsOfUser, timeSave, TimeUnit.SECONDS);
        return session;
    }

    @Override
    public List<SessionResponse> getAllByUser(String userId) {
        return redisService.get(generateRedisKey(userId), new TypeReference<>() {});
    }

    private String generateRedisKey(String userId) {
        return BASE_SESSION_KEY + "_" + userId;
    }

    private String getToken() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return null;
    }
}
