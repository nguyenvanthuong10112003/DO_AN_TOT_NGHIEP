package com.e_learning.service;

import com.e_learning.common.Const;
import com.e_learning.entity.Role;
import com.e_learning.entity.User;
import com.e_learning.exception.AppException;
import com.e_learning.exception.ErrorCode;
import com.e_learning.helper.DataUtil;
import com.e_learning.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;

public class BaseAuthedService {
    @Autowired
    protected UserRepository userRepository;
    protected String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
    protected User getCurrentUser() {
        return userRepository.findByIdAndStatus(getCurrentUserId(), Const.STATUS_ACTIVE)
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));
    }
    protected String getAccessToken() {
        ServletRequestAttributes attr =
            (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attr == null) return null;

        String bearer = attr.getRequest().getHeader("Authorization");
        if (bearer != null && bearer.startsWith("Bearer ")) {
            return bearer.replace("Bearer ", "").trim();
        }
        return null;
    }
    protected boolean checkUserWithRole(User user, Role role) {
        if (user == null) return false;
        if (role == null) return true;
        if (DataUtil.isNullOrEmpty(user.getRoles())) return false;
        return user.getRoles().contains(role);
    }
    protected boolean checkUserWithRoles(User user, List<Role> roles) {
        if (user == null) return false;
        if (DataUtil.isNullOrEmpty(roles)) return true;
        if (DataUtil.isNullOrEmpty(user.getRoles())) return false;
        return roles.stream().allMatch(role -> checkUserWithRole(user, role));
    }
}
