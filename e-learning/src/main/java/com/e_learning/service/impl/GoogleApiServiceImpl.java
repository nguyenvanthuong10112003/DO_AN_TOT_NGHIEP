package com.e_learning.service.impl;

import com.e_learning.client.Oauth2GoogleApiClient;
import com.e_learning.client.dto.GoogleIntrospectRequest;
import com.e_learning.client.dto.GoogleIntrospectResponse;
import com.e_learning.client.dto.GoogleUserInfoResponse;
import com.e_learning.dto.request.LinkGoogleAccountRequest;
import com.e_learning.exception.AppException;
import com.e_learning.exception.ErrorCode;
import com.e_learning.service.GoogleApiService;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.text.ParseException;

@Slf4j
@Service
public class GoogleApiServiceImpl implements GoogleApiService {
    @Value("${links.google-api.client-id}")
    private String GOOGLE_CLIENT_ID;
    @Value("${links.google-api.client-secret}")
    private String GOOGLE_CLIENT_SECRET;
    @Autowired
    private Oauth2GoogleApiClient oauth2GoogleApiClient;
    @Override
    public GoogleUserInfoResponse getInfoUser(LinkGoogleAccountRequest request) {
        GoogleIntrospectRequest req = GoogleIntrospectRequest.builder()
            .code(request.getCode())
            .clientId(GOOGLE_CLIENT_ID)
            .clientSecret(GOOGLE_CLIENT_SECRET)
            .redirectUri(request.getRedirectUri())
            .grantType("authorization_code")
            .build();

        // goi api xac thuc tai khoan google
        ResponseEntity<GoogleIntrospectResponse> response = null;
        try {
            response = oauth2GoogleApiClient.introspect(req);
        } catch (Exception e) {
            log.error("Error auth google account: {}", e.getMessage());
            e.printStackTrace();
        }

        if (response == null || !response.getStatusCode().is2xxSuccessful() || response.getBody() == null)
            throw new AppException(ErrorCode.CANNOT_AUTH_GOOGLE_ACCOUNT);

        try {
            GoogleUserInfoResponse googleUserInfo = new GoogleUserInfoResponse();
            SignedJWT signedJWT = SignedJWT.parse(response.getBody().getIdToken());
            JWTClaimsSet jwtClaimsSet = signedJWT.getJWTClaimsSet();
            googleUserInfo.setId(jwtClaimsSet.getSubject());
            googleUserInfo.setEmail(jwtClaimsSet.getStringClaim("email"));
            googleUserInfo.setVerifiedEmail(jwtClaimsSet.getBooleanClaim("verified_email"));
            googleUserInfo.setName(jwtClaimsSet.getStringClaim("name"));
            googleUserInfo.setPicture(jwtClaimsSet.getStringClaim("picture"));
            return googleUserInfo;
        } catch (ParseException ignored) {
            throw new AppException(ErrorCode.CANNOT_DECODE_TOKEN);
        }
    }
}
