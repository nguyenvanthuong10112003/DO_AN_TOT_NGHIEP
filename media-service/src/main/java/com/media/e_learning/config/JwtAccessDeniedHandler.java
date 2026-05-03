package com.media.e_learning.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.media.e_learning.dto.ResponseApi;
import com.media.e_learning.exception.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException ex) throws IOException {

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;

        ResponseApi<?> apiResponse = ResponseApi.builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();

        response.setStatus(errorCode.getHttpStatus().value()); // 403

        response.getWriter().write(
            new ObjectMapper().writeValueAsString(apiResponse)
        );
    }
}