package com.e_learning.service.impl;

import com.e_learning.client.MediaServiceClient;
import com.e_learning.client.Oauth2GoogleApiClient;
import com.e_learning.common.Const;
import com.e_learning.common.EmailBody;
import com.e_learning.config.JwtCustom;
import com.e_learning.dto.request.AuthRequest;
import com.e_learning.dto.request.IntrospectTokenRequest;
import com.e_learning.dto.request.LinkGoogleAccountRequest;
import com.e_learning.dto.request.SendEmailDTO;
import com.e_learning.dto.response.*;
import com.e_learning.entity.InvalidedToken;
import com.e_learning.entity.Photo;
import com.e_learning.entity.Role;
import com.e_learning.entity.User;
import com.e_learning.exception.AppException;
import com.e_learning.exception.ErrorCode;
import com.e_learning.helper.DataUtil;
import com.e_learning.mapper.PhotoMapper;
import com.e_learning.mapper.UserMapper;
import com.e_learning.repository.InvalidedTokenRepository;
import com.e_learning.repository.UserRepository;
import com.e_learning.service.AuthService;
import com.e_learning.service.GoogleApiService;
import com.e_learning.service.NotificationService;
import com.e_learning.service.PhotoService;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.logging.log4j.util.Strings;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.text.ParseException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Slf4j
@Service("authServiceImpl")
public class AuthServiceImpl implements AuthService {
    @Autowired
    private InvalidedTokenRepository invalidedTokenRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private Oauth2GoogleApiClient oauth2GoogleApiClient;
    @Autowired
    private JwtCustom jwtCustom;
    @Autowired
    private MediaServiceClient mediaServiceClient;
    @Autowired
    private PhotoMapper photoMapper;
    @Lazy
    @Resource(name = "authServiceImpl")
    private AuthService self;
    @Autowired
    private PhotoService photoService;
    @Autowired
    private GoogleApiService googleApiService;
    @Value("${verify.wait-between-sends}")
    private Long waitBetweenSends;
    @Value("${verify.max-continuous-sends}")
    private Long maxContinuousSends;
    @Value("${verify.continuous-window}")
    private Long continuousWindow;
    @Value("${verify.time-valid}")
    private Long timeValid;
    @Autowired
    private NotificationService notificationService;

    @Override
    public LoginResponse loginWithGoogleAccount(LinkGoogleAccountRequest request) {
        var googleUserInfo = googleApiService.getInfoUser(request);

        var userCheck = userRepository.findByEmailAndStatus(googleUserInfo.getEmail(), Const.STATUS_ACTIVE);
        if (userCheck.isPresent()) {
            var user = userCheck.get();
            if (Strings.isBlank(user.getGoogleClientId())) {
                user.setGoogleClientId(googleUserInfo.getId());
                userRepository.save(user);
            }
            return LoginResponse.builder()
                .accessToken(jwtCustom.encode(user))
                .userInfo(userMapper.toUserResponse(user))
                .build();
        }

        User newUser = User.builder()
            .fullName(googleUserInfo.getName())
            .email(googleUserInfo.getEmail())
            .username(googleUserInfo.getEmail().split("@")[0] + "_" + System.currentTimeMillis())
            .password(passwordEncoder.encode(UUID.randomUUID().toString()))
            .roles(new HashSet<Role>(Set.of(Role.USER)))
            .googleClientId(googleUserInfo.getId())
            .build();

        newUser = userRepository.save(newUser);

        String accessToken = jwtCustom.encode(newUser);
        UserResponse response = userMapper.toUserResponse(newUser);
        response.setAvatar(googleUserInfo.getPicture());

        saveAvatarPhoto(newUser, googleUserInfo.getPicture(), accessToken);

        return LoginResponse.builder()
            .accessToken(accessToken)
            .userInfo(response)
            .build();
    }

    @Async
    private void saveAvatarPhoto(User user, String pictureLink, String accessToken) {
        Photo photo = null;

        try {
            MultipartFile photoFile = DataUtil.convertImageUrlToMultipartFile(pictureLink);
            List<Photo> photos = photoService.uploadPhoto(List.of(photoFile), false, user.getId(), accessToken);
            photo = photos.get(0);
        } catch (Exception e) {
            log.error("Upload avatar failed", e);
            e.printStackTrace();
        }

        if (photo != null) {
            user.setAvatar(photo);
            userRepository.save(user);
        }
    }

    @Override
    public LoginResponse login(AuthRequest request) {
        User user = userRepository.findActiveByUsernameOrEmail(request.getUsername(), request.getUsername())
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword()))
            throw new AppException(ErrorCode.PASSWORD_INCORRECT);

        if (!Const.STATUS_ACTIVE.equals(user.getStatus()))
            throw new AppException(ErrorCode.ACCOUNT_UNACTIVE);

        if (DataUtil.boolValue(request.getWithRoleAdmin()) !=
            DataUtil.defaultIfNull(user.getRoles(), new HashSet<>()).stream().anyMatch(Role.ADMIN::equals))
            throw new AppException(ErrorCode.DO_NOT_HAVE_PERMISSION);

        return LoginResponse.builder()
            .accessToken(jwtCustom.encode(user))
            .userInfo(userMapper.toUserResponse(user))
            .build();
    }

    @Override
    @Transactional
    public LoginResponse register(AuthRequest request) {
        boolean isEmailValid = DataUtil.isEmailValid(request.getUsername());
        if (!isEmailValid && !DataUtil.isUsernameValid(request.getUsername()))
            throw new RuntimeException("Email or username not valid");

        if (userRepository.existsActiveByUsernameOrEmail(request.getUsername(), request.getUsername()))
            throw new AppException(ErrorCode.USER_EXISTED);

        User user = User.builder()
            .username(request.getUsername())
            .password(passwordEncoder.encode(request.getPassword()))
            .fullName(request.getUsername())
            .roles(Set.of(Role.USER))
            .build();

        if (isEmailValid)
            user.setEmail(request.getUsername());

        user = userRepository.save(user);
        return LoginResponse.builder()
            .accessToken(jwtCustom.encode(user))
            .userInfo(userMapper.toUserResponse(user))
            .build();
    }

    @Override
    @Transactional
    public void logout() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        JwtAuthenticationToken jwtAuth = (JwtAuthenticationToken) authentication;
        String tokenId = jwtAuth.getToken().getClaims().get("jti").toString();

        if (invalidedTokenRepository.existsById(tokenId))
            return;

        InvalidedToken newInvalidatedToken = InvalidedToken.builder()
                .id(tokenId)
                .build();

        Instant expiryTimeInstant = jwtAuth.getToken().getExpiresAt();
        if (expiryTimeInstant != null)
            newInvalidatedToken.setExpiryTime(DataUtil.toLocalDateTime(expiryTimeInstant));

        invalidedTokenRepository.save(newInvalidatedToken);
    }

    @Transactional
    @Override
    public RefreshTokenResponse refreshToken(String token) {
        if (Strings.isBlank(token)) throw new AppException(ErrorCode.TOKEN_REQUIRED);

        try {
            jwtCustom.verifyToken(token, true);
        } catch (JOSEException | ParseException | AppException e) {
            throw new AppException(ErrorCode.TOKEN_INVALID);
        }

        JWTClaimsSet jwtClaimsSet;
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            jwtClaimsSet = signedJWT.getJWTClaimsSet();
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }

        if (invalidedTokenRepository.existsById(jwtClaimsSet.getJWTID()))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        invalidedTokenRepository.save(InvalidedToken.builder()
            .id(jwtClaimsSet.getJWTID())
            .expiryTime(DataUtil.toLocalDateTime(jwtClaimsSet.getExpirationTime().toInstant()))
            .build());

        String userId = jwtClaimsSet.getSubject();
        var user = userRepository.findById(userId)
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));

        return RefreshTokenResponse.builder()
                .token(jwtCustom.encode(user))
                .build();
    }

    @Override
    public IntrospectTokenResponse introspectToken(IntrospectTokenRequest request) {
        try {
            jwtCustom.verifyToken(request.getToken(), false);
        } catch (JOSEException | ParseException | AppException e) {
            throw new AppException(ErrorCode.TOKEN_INVALID);
        }

        JWTClaimsSet jwtClaimsSet;
        try {
            SignedJWT signedJWT = SignedJWT.parse(request.getToken());
            jwtClaimsSet = signedJWT.getJWTClaimsSet();
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }

        String userId = jwtClaimsSet.getSubject();
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));

        return IntrospectTokenResponse.builder()
            .isValid(true)
            .userResponse(userMapper.toUserResponse(user))
            .build();
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public void createVerifyCode(String email) {
        if (!DataUtil.isEmailValid(email))
            throw new RuntimeException("Email is invalid");

        var currentUser = userRepository.findByEmailAndStatus(email, Const.STATUS_ACTIVE)
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));

        LocalDateTime now = DataUtil.now();
        LocalDateTime lastCreateAt = currentUser.getVerifyCodeCreateAt();

        if (lastCreateAt != null) {
            long distance = ChronoUnit.SECONDS.between(lastCreateAt, now);

            // 1. Check delay giữa các lần gửi
            if (distance < waitBetweenSends) {
                throw new AppException(ErrorCode.VERIFY_SEND_TOO_FAST);
            }

            Long currentCount = DataUtil.defaultIfNull(currentUser.getVerifyCountSentContinuous(), 0L);

            // 2. Nếu vẫn trong window → check max
            if (distance <= continuousWindow) {
                if (currentCount >= maxContinuousSends) {
                    throw new AppException(ErrorCode.VERIFY_SEND_LIMIT_REACHED);
                }
                currentUser.setVerifyCountSentContinuous(currentCount + 1);
            } else {
                // 3. Nếu ngoài window → reset count
                currentUser.setVerifyCountSentContinuous(1L);
            }
        } else {
            // lần đầu
            currentUser.setVerifyCountSentContinuous(1L);
        }

        // 4. Generate code
        String code = DataUtil.generateCode(6);
        currentUser.setVerifyCode(passwordEncoder.encode(code));
        currentUser.setVerifyCodeCreateAt(now);
        currentUser.setVerifyCodeExpireAt(now.plusSeconds(timeValid));
        currentUser.setVerifyCodeUsed(false);
        userRepository.save(currentUser);

        Map<String, String> mapping = new HashMap<>();
        mapping.put("name", currentUser.getFullName());
        mapping.put("appName", "E-Learning");
        mapping.put("year", String.valueOf(now.getYear()));

        notificationService.sendEmailAsync(SendEmailDTO.builder()
            .title("[E-Learning] XÁC THỰC TÀI KHOẢN")
            .receiver(currentUser.getEmail())
            .template(Const.TEMPLATE_SEND_EMAIL_CONTENT)
            .body(EmailBody.createBodySendVerifyCode(code, currentUser.getVerifyCodeExpireAt()))
            .mapping(mapping)
            .build());
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public void createNewPassword(String email, String verifyCode) {
        if (!DataUtil.isEmailValid(email))
            throw new RuntimeException("Email is invalid");

        if (Strings.isBlank(verifyCode))
            throw new AppException(ErrorCode.VERIFY_CODE_INVALID);

        var user = userRepository.findByEmailAndStatus(email, Const.STATUS_ACTIVE)
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));

        if (!passwordEncoder.matches(verifyCode, user.getVerifyCode()))
            throw new AppException(ErrorCode.VERIFY_CODE_INVALID);

        LocalDateTime now = DataUtil.now();
        if (user.getVerifyCodeExpireAt() == null ||
                user.getVerifyCodeExpireAt().isBefore(now))
            throw new AppException(ErrorCode.VERIFY_CODE_EXPIRED);

        if (DataUtil.boolValue(user.getVerifyCodeUsed()))
            throw new AppException(ErrorCode.VERIFY_CODE_ALREADY_USED);

        String newPassword = DataUtil.generateRandomPassword(10);
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setVerifyCodeUsed(true);
        userRepository.save(user);

        Map<String, String> mapping = new HashMap<>();
        mapping.put("name", user.getFullName());
        mapping.put("appName", "E-Learning");
        mapping.put("year", String.valueOf(now.getYear()));

        notificationService.sendEmailAsync(SendEmailDTO.builder()
            .title("[E-Learning] ĐẶT LẠI MẬT KHẨU")
            .receiver(user.getEmail())
            .template(Const.TEMPLATE_SEND_EMAIL_CONTENT)
            .body(EmailBody.createBodySendNewPassword(newPassword))
            .mapping(mapping)
            .build());
    }
}
