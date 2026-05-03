package com.e_learning.controller;

import com.e_learning.dto.request.AuthRequest;
import com.e_learning.dto.request.IntrospectTokenRequest;
import com.e_learning.dto.request.LinkGoogleAccountRequest;
import com.e_learning.dto.response.ResponseApi;
import com.e_learning.exception.AppException;
import com.e_learning.exception.ErrorCode;
import com.e_learning.helper.DataUtil;
import com.e_learning.service.AuthService;
import jakarta.validation.Valid;
import org.apache.logging.log4j.util.Strings;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;
import java.util.Map;

@RequestMapping("/auth")
@RestController
public class AuthController extends BaseController {
    @Autowired
    private AuthService authService;

    @PostMapping("/login-with-google-account")
    public ResponseApi<?> loginWithGoogleAccount(@RequestBody @Valid LinkGoogleAccountRequest request) {
        try {
            return ResponseApi.createSuccess(authService.loginWithGoogleAccount(request));
        } catch (Exception e) {
            throw generateError(e);
        }
    }

    @PostMapping("/login")
    public ResponseApi<?> login(@RequestBody @Valid AuthRequest request) {
        try {
           return ResponseApi.createSuccess(authService.login(request));
        } catch (Exception e) {
            throw generateError(e);
        }
    }

    @PostMapping("/register")
    public ResponseApi<?> register(@RequestBody @Valid AuthRequest request) {
        try {
           return ResponseApi.createSuccess(authService.register(request));
        } catch (Exception e) {
            throw generateError(e);
        }
    }

    @PostMapping("/refresh")
    public ResponseApi<?> refresh(@RequestBody Map<String, String> params) {
        try {
            return ResponseApi.createSuccess(authService.refreshToken(params.get("token")));
        } catch (ParseException e) {
            throw generateError(e);
        }
    }

    @PostMapping("/introspect")
    public ResponseApi<?> introspect(@RequestBody @Valid IntrospectTokenRequest request) {
        try {
            return ResponseApi.createSuccess(authService.introspectToken(request));
        } catch (Exception e) {
            throw generateError(e);
        }
    }

    @PostMapping("/logout")
    public ResponseApi<?> logout() {
        try {
            authService.logout();
            return ResponseApi.createSuccess();
        } catch (Exception e) {
            throw generateError(e);
        }
    }

    @PostMapping(value = "/create-verify-code")
    public ResponseApi<?> createVerifyCode(@RequestBody @Valid Map<String, String> params) {
        try {
            authService.createVerifyCode(params.get("email"));
            return ResponseApi.createSuccess();
        } catch (Exception e) {
            throw generateError(e);
        }
    }

    @PostMapping(value = "/create-new-password")
    private ResponseApi<?> createNewPassword(@RequestBody @Valid Map<String, String> params) {
        try {
            authService.createNewPassword(params.get("email"), params.get("verifyCode"));
            return ResponseApi.createSuccess();
        } catch (Exception e) {
            throw generateError(e);
        }
    }
}
