package com.e_learning.mapper;

import com.e_learning.dto.request.CourseCreateOrUpdateRequest;
import com.e_learning.entity.Course;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CourseMapper {
    @Mapping(target = "id", ignore = true)
    void update(@MappingTarget Course course, CourseCreateOrUpdateRequest request);
}
