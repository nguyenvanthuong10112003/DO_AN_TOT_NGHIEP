package com.media.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.media.dto.ResponseApi;
import com.media.exception.AuthException;
import com.media.exception.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtAuthEntryPoint implements AuthenticationEntryPoint {
    @Override
    public void commence(
            HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
            throws IOException {
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        ErrorCode errorCode = ErrorCode.UNAUTHENTICATED;
        ResponseApi<?> apiResponse;

        if (authException instanceof AuthException ex)
            apiResponse = ex.getResponseApi();
        else
            apiResponse = ResponseApi.builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();

        response.setStatus(errorCode.getHttpStatus().value());
        response.getWriter().write(
            new ObjectMapper().writeValueAsString(apiResponse)
        );
    }
}