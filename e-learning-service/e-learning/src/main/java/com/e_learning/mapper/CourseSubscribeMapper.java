package com.e_learning.mapper;

import com.e_learning.dto.SubscribeDTO;
import com.e_learning.entity.CourseSubscribe;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CourseSubscribeMapper {
    @Mapping(target = "userId", source = "course.user.id")
    @Mapping(target = "courseId", source = "course.course.id")
    @Mapping(target = "course", ignore = true)
    @Mapping(target = "user", ignore = true)
    SubscribeDTO toDTO(CourseSubscribe course);
    List<SubscribeDTO> toLstDTO(List<CourseSubscribe> courses);
}
