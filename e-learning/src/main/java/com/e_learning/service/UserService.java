package com.e_learning.service;

import com.e_learning.dto.request.ChangePasswordRequest;
import com.e_learning.dto.request.LinkGoogleAccountRequest;
import com.e_learning.dto.request.UserUpdateRequest;
import com.e_learning.dto.response.UserResponse;

public interface UserService {
    UserResponse getMindInfo();
    String linkGoogleAccount(LinkGoogleAccountRequest request);
    UserResponse updateInfo(UserUpdateRequest request);
    void changePassword(ChangePasswordRequest request);
}
