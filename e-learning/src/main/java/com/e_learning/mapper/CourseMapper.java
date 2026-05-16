package com.e_learning.mapper;

import com.e_learning.dto.request.CourseCreateOrUpdateRequest;
import com.e_learning.dto.response.CourseResponse;
import com.e_learning.entity.Course;
import com.e_learning.entity.CourseTag;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = {TagMapper.class, TopicMapper.class, CourseCertificateMapper.class, PhotoMapper.class})
public interface CourseMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "lstRequiredKnowledge", ignore = true)
    @Mapping(target = "tags", ignore = true)
    @Mapping(target = "suggestCourses", ignore = true)
    void update(@MappingTarget Course course, CourseCreateOrUpdateRequest request);

    @Mapping(target = "thumbnailId", source = "course.thumbnail.id")
    @Mapping(target = "sector", source = "course.topic.sector")
    @Mapping(target = "sectorId", source = "course.topic.sector.id")
    @Mapping(target = "topicId", source = "course.topic.id")
    @Mapping(target = "suggestCourses", qualifiedByName = "toLstResponseLite")
    CourseResponse toResponse(Course course);

    List<CourseResponse> toLstResponse(List<Course> courses);

    @Named("toResponseLite")
    @Mapping(target = "suggestCourses", ignore = true)
    CourseResponse toResponseLite(Course entity);

    @Named("toLstResponseLite")
    default List<CourseResponse> toLstResponseLite(List<Course> list) {
        if (list == null) return null;
        return list.stream()
                .map(this::toResponseLite)
                .toList();
    }
}
