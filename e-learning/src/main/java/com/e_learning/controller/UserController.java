package com.e_learning.controller;

import com.e_learning.dto.request.ChangePasswordRequest;
import com.e_learning.dto.request.LinkGoogleAccountRequest;
import com.e_learning.dto.request.UserUpdateRequest;
import com.e_learning.dto.response.ResponseApi;
import com.e_learning.dto.response.UserResponse;
import com.e_learning.exception.AppException;
import com.e_learning.exception.ErrorCode;
import com.e_learning.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController extends BaseController {
    @Autowired
    private UserService userService;
    @GetMapping("/mind")
    public ResponseApi<UserResponse> getMindInfo() {
        try {
            return ResponseApi.createSuccess(userService.getMindInfo());
        } catch (Exception e) {
            throw generateError(e);
        }
    }
    @PostMapping("/link-google-account")
    public ResponseApi<?> linkGoogleAccount(@RequestBody @Valid LinkGoogleAccountRequest request) {
        try {
            return ResponseApi.createSuccess(userService.linkGoogleAccount(request));
        } catch (Exception e) {
            throw generateError(e);
        }
    }
    @PostMapping(value = "/update-info", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseApi<?> updateInfo(@ModelAttribute @Valid UserUpdateRequest request) {
        try {
            return ResponseApi.createSuccess(userService.updateInfo(request));
        } catch (Exception e) {
            throw generateError(e);
        }
    }
    @PostMapping(value = "/change-pw")
    private ResponseApi<?> changePassword(@RequestBody @Valid ChangePasswordRequest request) {
        try {
            userService.changePassword(request);
            return ResponseApi.createSuccess();
        } catch (Exception e) {
            throw generateError(e);
        }
    }
}