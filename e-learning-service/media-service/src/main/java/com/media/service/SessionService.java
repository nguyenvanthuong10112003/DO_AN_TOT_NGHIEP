package com.media.service;

import com.media.dto.SessionCreateRequest;
import com.media.dto.SessionResponse;

import java.util.List;

public interface SessionService {
    SessionResponse createSession(SessionCreateRequest request);
    List<SessionResponse> getAllByUser(String userId);
}
