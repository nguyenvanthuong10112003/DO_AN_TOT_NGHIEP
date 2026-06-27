package com.e_learning.exception;

import com.e_learning.dto.response.ResponseApi;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception exception) {
        if (exception instanceof AppException appException) {
            ErrorCode errorCode = appException.getErrorCode();
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
