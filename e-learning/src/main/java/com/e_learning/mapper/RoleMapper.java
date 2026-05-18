package com.e_learning.mapper;

import com.e_learning.common.Const.Role;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class RoleMapper {
    public String toStr(Role role) {
        if (role == null) return null;
        return role.getName();
    }

    public Set<String> toLstStr(Set<Role> roles) {
        if (roles == null) return Collections.emptySet();
        return roles.stream().map(this::toStr).collect(Collectors.toSet());
    }
}
