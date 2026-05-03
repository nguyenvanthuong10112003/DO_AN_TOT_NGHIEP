package com.e_learning.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    INVALID_KEY(1000,"Invalid message key", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(9000, "UNAUTHENTICATED", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(9001, "UNAUTHORIZED", HttpStatus.UNAUTHORIZED),
    CANNOT_AUTH_GOOGLE_ACCOUNT(1001, "Cannot authorization google account", HttpStatus.BAD_REQUEST),
    CANNOT_DECODE_TOKEN(1002, "Cannot decode token", HttpStatus.BAD_REQUEST),
    USER_NOT_EXIST(1003, "User not exist", HttpStatus.BAD_REQUEST),
    PHOTO_NOT_EXIST(1004, "Photo not existed", HttpStatus.BAD_REQUEST),
    UNKNOW_ERROR(1005, "Unknow error", HttpStatus.BAD_REQUEST),
    PASSWORD_INCORRECT(1006, "Password incorrect", HttpStatus.BAD_REQUEST),
    ACCOUNT_UNACTIVE(1007, "Account unactive", HttpStatus.BAD_REQUEST),
    DO_NOT_HAVE_PERMISSION(1008, "Do not have permission", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1009, "User existed", HttpStatus.BAD_REQUEST),
    TOKEN_INVALID(1010, "Token invalid", HttpStatus.BAD_REQUEST),
    TOKEN_REQUIRED(1011, "Token required", HttpStatus.BAD_REQUEST),
    GOOGLE_ACCOUNT_LINKED_BY_OTHER_USER(1012, "Google account linked by other user", HttpStatus.BAD_REQUEST),
    ACCOUNT_LINKED(1013, "Account linked", HttpStatus.BAD_REQUEST),
    USERNAME_EXISTED(1014, "Username existed", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND(1015, "User not found", HttpStatus.NOT_FOUND),
    INVALID_CREDENTIALS(1016, "Username or password is incorrect", HttpStatus.UNAUTHORIZED),
    VERIFY_CODE_INVALID(1017, "Verify code is invalid", HttpStatus.BAD_REQUEST),
    VERIFY_CODE_EXPIRED(1018, "Verify code has expired", HttpStatus.BAD_REQUEST),
    VERIFY_CODE_ALREADY_USED(1019, "Verify code has already been used", HttpStatus.BAD_REQUEST),
    VERIFY_SEND_TOO_FAST(1020, "Please wait before sending another code", HttpStatus.TOO_MANY_REQUESTS),
    VERIFY_SEND_LIMIT_REACHED(1021, "You have reached the maximum number of attempts", HttpStatus.TOO_MANY_REQUESTS),
    TOPIC_NOT_EXIST(1022, "Topic not exist", HttpStatus.BAD_REQUEST),
    COURSE_NOT_EXIST(1023, "Course not exist", HttpStatus.BAD_REQUEST)
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
