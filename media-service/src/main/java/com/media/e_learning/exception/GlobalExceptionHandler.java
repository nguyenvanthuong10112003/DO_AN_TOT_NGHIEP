package com.media.e_learning.exception;

import com.media.e_learning.dto.ResponseApi;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(AppException.class)
    public ResponseEntity<?> handlerAppException(AppException appException) {
        ErrorCode errorCode = appException.getErrorCode();
        if (errorCode == null) errorCode = ErrorCode.UNKNOW_ERROR;
        return ResponseEntity.status(errorCode.getHttpStatus())
                .body(ResponseApi.createError(errorCode));
    }
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handlerRuntimeException(RuntimeException runtimeException) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ResponseApi.builder()
                        .code(-1)
                        .message(runtimeException.getMessage())
                        .build());
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handlerException(Exception runtimeException) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ResponseApi.builder()
                        .code(-1)
                        .message(runtimeException.getMessage())
                        .build());
    }
}