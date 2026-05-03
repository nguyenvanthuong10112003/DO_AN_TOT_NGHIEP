package com.media.e_learning.service;

import com.media.e_learning.dto.SessionCreateRequest;
import com.media.e_learning.dto.SessionResponse;

import java.util.List;

public interface SessionService {
    SessionResponse createSession(SessionCreateRequest request);
    List<SessionResponse> getAllByUser(String userId);
}
