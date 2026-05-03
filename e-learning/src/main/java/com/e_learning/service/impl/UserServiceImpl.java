package com.e_learning.service.impl;

import com.e_learning.common.Const;
import com.e_learning.dto.request.ChangePasswordRequest;
import com.e_learning.dto.request.LinkGoogleAccountRequest;
import com.e_learning.dto.request.UserUpdateRequest;
import com.e_learning.dto.response.UserResponse;
import com.e_learning.entity.Photo;
import com.e_learning.exception.AppException;
import com.e_learning.exception.ErrorCode;
import com.e_learning.helper.DataUtil;
import com.e_learning.mapper.UserMapper;
import com.e_learning.repository.UserRepository;
import com.e_learning.service.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.logging.log4j.util.Strings;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
public class UserServiceImpl extends BaseAuthedService implements UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private GoogleApiService googleApiService;
    @Autowired
    private PhotoService photoService;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserResponse getMindInfo() {
        var user = getCurrentUser();
        return userMapper.toUserResponse(user);
    }

    @Override
    public String linkGoogleAccount(LinkGoogleAccountRequest request) {
        var googleUserInfo = googleApiService.getInfoUser(request);

        if (userRepository.existsByEmailAndStatus(googleUserInfo.getEmail(), Const.STATUS_ACTIVE))
            throw new AppException(ErrorCode.GOOGLE_ACCOUNT_LINKED_BY_OTHER_USER);

        var user = getCurrentUser();
        if (!(Strings.isBlank(user.getEmail()) || Strings.isBlank(user.getGoogleClientId())))
            throw new AppException(ErrorCode.ACCOUNT_LINKED);

        user.setEmail(googleUserInfo.getEmail());
        user.setGoogleClientId(googleUserInfo.getId());
        userRepository.save(user);

        return googleUserInfo.getEmail();
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public UserResponse updateInfo(UserUpdateRequest request) {
        var user = getCurrentUser();
        if (!DataUtil.equals(user.getUsername(), request.getUsername()) &&
                userRepository.existsActiveByUsernameAndNotInIds(request.getUsername(), List.of(user.getId())))
            throw new AppException(ErrorCode.USER_EXISTED);
        userMapper.update(user, request);
        if (request.getAvatarFile() != null) {
            Photo oldPhoto = user.getAvatar();
            try {
                List<Photo> newPhoto = photoService.uploadPhoto(List.of(request.getAvatarFile()), false, user.getId(), getAccessToken());
                if (!DataUtil.isNullOrEmpty(newPhoto))
                    user.setAvatar(newPhoto.get(0));
            } catch (Exception e) {
                log.error("Error upload image: {}", e.getMessage());
                e.printStackTrace();
            }
            try {
                if (oldPhoto != null)
                    photoService.removePhoto(List.of(oldPhoto), getAccessToken());
            } catch (Exception e) {
                log.error("Error remove image: {}", e.getMessage());
                e.printStackTrace();
            }
        }
        return userMapper.toUserResponse(userRepository.save(user));
    }

    @Transactional
    @Override
    public void changePassword(ChangePasswordRequest request) {
        var user = getCurrentUser();
        if (DataUtil.equals(request.getNewPassword(), request.getOldPassword()))
            throw new RuntimeException("New password cannot match old password");
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword()))
            throw new AppException(ErrorCode.PASSWORD_INCORRECT);
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}