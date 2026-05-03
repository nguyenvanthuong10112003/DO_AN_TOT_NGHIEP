package com.e_learning.service;

import com.e_learning.dto.request.AuthRequest;
import com.e_learning.dto.request.IntrospectTokenRequest;
import com.e_learning.dto.request.LinkGoogleAccountRequest;
import com.e_learning.dto.response.IntrospectTokenResponse;
import com.e_learning.dto.response.LoginResponse;
import com.e_learning.dto.response.RefreshTokenResponse;
import com.e_learning.entity.User;

import java.text.ParseException;

public interface AuthService {
    LoginResponse loginWithGoogleAccount(LinkGoogleAccountRequest request);
    LoginResponse login(AuthRequest request);
    void logout();
    LoginResponse register(AuthRequest request);
    RefreshTokenResponse refreshToken(String token) throws ParseException;
    IntrospectTokenResponse introspectToken(IntrospectTokenRequest request);
    void createVerifyCode(String email);
    void createNewPassword(String email, String verifyCode);
}
