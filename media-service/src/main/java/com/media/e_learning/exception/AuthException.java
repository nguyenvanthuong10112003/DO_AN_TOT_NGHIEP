package com.media.e_learning.exception;

import com.media.e_learning.dto.ResponseApi;
import lombok.NonNull;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;

public class AuthException extends AuthenticationException {

    private final ResponseApi<?> responseApi;

    public AuthException(@NonNull ResponseApi<?> responseApi) {
        super(responseApi.getMessage());
        this.responseApi = responseApi;
    }

    public AuthException(String message) {
        super(message);
        this.responseApi = ResponseApi.builder().code(HttpStatus.UNAUTHORIZED.value()).message(message).build();
    }

    public ResponseApi<?> getResponseApi() {
        return responseApi;
    }
}