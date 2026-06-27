package com.media.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    UNAUTHENTICATED(9000, "UNAUTHENTICATED", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(9001, "UNAUTHORIZED", HttpStatus.UNAUTHORIZED),
    UNKNOW_ERROR(1005, "Unknow error", HttpStatus.BAD_REQUEST),
    ;
    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
    private final int code;
    private final String message;
    private final HttpStatus httpStatus;
}
