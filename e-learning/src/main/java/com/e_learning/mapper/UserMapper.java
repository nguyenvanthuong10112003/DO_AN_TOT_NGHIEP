package com.e_learning.mapper;

import com.e_learning.dto.request.UserUpdateRequest;
import com.e_learning.dto.response.UserResponse;
import com.e_learning.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = {RoleMapper.class, PhotoMapper.class})
public interface UserMapper {
    UserResponse toUserResponse(User user);
    void update(@MappingTarget User user, UserUpdateRequest userUpdateRequest);
}
