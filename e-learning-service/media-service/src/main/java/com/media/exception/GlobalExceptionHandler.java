package com.media.exception;

import com.media.dto.ResponseApi;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handlerException(Exception exception,  HttpServletRequest request) {
        log.error(exception.getMessage());
        if (request.getRequestURI().contains("/videos/play")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        if (exception instanceof AppException) {
            ErrorCode errorCode = ((AppException) exception).getErrorCode();
            if (errorCode == null) errorCode = ErrorCode.UNKNOW_ERROR;
            return ResponseEntity.status(errorCode.getHttpStatus())
                    .body(ResponseApi.createError(errorCode));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ResponseApi.builder()
                        .code(-1)
                        .message(exception.getMessage())
                        .build());
    }
}