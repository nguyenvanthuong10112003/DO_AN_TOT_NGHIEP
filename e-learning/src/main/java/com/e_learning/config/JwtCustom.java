package com.e_learning.config;

import com.e_learning.common.Const;
import com.e_learning.entity.User;
import com.e_learning.exception.AppException;
import com.e_learning.exception.ErrorCode;
import com.e_learning.helper.DataUtil;
import com.e_learning.repository.InvalidedTokenRepository;
import com.e_learning.repository.UserRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;
import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Component
public class JwtCustom implements JwtDecoder {
    @Value("${jwt.signer-key}")
    private String signerKey;
    @Value("${jwt.valid-duration}")
    private long validDuration;
    @Value("${jwt.refresh-valid-duration}")
    private long refreshValidDuration;
    private NimbusJwtDecoder nimbusJwtDecoder = null;
    @Autowired
    private InvalidedTokenRepository invalidatedTokenRepository;
    @Autowired
    private UserRepository userRepository;

    public String encode(User user) {
        JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
            .subject(user.getId())
            .issuer("couple-app.api")
            .issueTime(new Date())
            .claim("roles", user.getRoles().stream().map(role -> "ROLE_" + role.getName()).collect(Collectors.toSet()))
            .expirationTime(
                new Date(Instant.now()
                    .plus(validDuration, ChronoUnit.SECONDS)
                    .toEpochMilli()))
            .jwtID(UUID.randomUUID().toString())
            .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(jwsHeader, payload);

        try {
            jwsObject.sign(new MACSigner(signerKey.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public Jwt decode(String token) throws JwtException {
        try {
            verifyToken(token, false);
        } catch (JOSEException | ParseException e) {
            throw new JwtException(e.getMessage());
        } catch (AppException e) {
            throw new JwtException("Token invalid");
        }

        if (Objects.isNull(nimbusJwtDecoder)) {
            SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes(), "HS512");
            nimbusJwtDecoder = NimbusJwtDecoder.withSecretKey(secretKeySpec)
                .macAlgorithm(MacAlgorithm.HS512)
                .build();
        }

        return nimbusJwtDecoder.decode(token);
    }

    public void verifyToken(String token, boolean isRefresh) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(signerKey.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        Date createdTime = signedJWT.getJWTClaimsSet().getIssueTime();

        var verified = signedJWT.verify(verifier);

        var now = new Date();

        if (!verified || now.after(isRefresh ? DataUtil.plusSeconds(createdTime, refreshValidDuration) : expiryTime))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        if (!userRepository.existsByIdAndStatus(signedJWT.getJWTClaimsSet().getSubject(), Const.STATUS_ACTIVE))
            throw new AppException(ErrorCode.USER_NOT_EXIST);

        if (invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID()))
            throw new AppException(ErrorCode.UNAUTHENTICATED);
    }
}
