package com.e_learning.mapper;

import com.e_learning.dto.request.CourseCreateOrUpdateRequest;
import com.e_learning.dto.response.CourseResponse;
import com.e_learning.entity.Course;
import com.e_learning.entity.Evaluate;
import com.e_learning.entity.Lesson;
import com.e_learning.entity.LessonChapter;
import com.e_learning.helper.DataUtil;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Mapper(componentModel = "spring", uses = {TagMapper.class, TopicMapper.class, PhotoMapper.class})
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
    @Mapping(target = "countSubscribe", expression = "java(course.getSubscribes() == null ? 0 : course.getSubscribes().size())")
    @Mapping(target = "evaluate", expression = "java(averageEvaluate(course.getEvaluates()))")
    @Mapping(target = "countEvaluate", expression = "java(course.getEvaluates() == null ? 0 : course.getEvaluates().size())")
    @Mapping(target = "chapters", ignore = true)
    @Mapping(target = "countLesson", ignore = true)
    @Mapping(target = "totalTime", ignore = true)
    @Mapping(target = "thumbnail", source = "thumbnail", qualifiedByName = "toPhotoUrl")
    CourseResponse toResponse(Course course);

    List<CourseResponse> toLstResponse(List<Course> courses);

    @Named("toResponseLite")
    @Mapping(target = "suggestCourses", ignore = true)
    @Mapping(target = "thumbnail", source = "thumbnail", qualifiedByName = "toPhotoUrl")
    CourseResponse toResponseLite(Course entity);

    @Named("toLstResponseLite")
    default List<CourseResponse> toLstResponseLite(List<Course> list) {
        if (list == null) return null;
        return list.stream()
                .map(this::toResponseLite)
                .toList();
    }

    default double averageEvaluate(List<Evaluate> evaluates) {
        if (DataUtil.isNullOrEmpty(evaluates)) return 0D;
        return evaluates.stream()
                .mapToDouble(evaluate ->
                    DataUtil.<Double>defaultIfNull(DataUtil.parseToDouble(evaluate.getStarNo()), 0D))
                .average()
                .orElse(0D);
    }

    default int countLesson(List<LessonChapter> chapters) {
        if (DataUtil.isNullOrEmpty(chapters)) return 0;
        return chapters.stream().filter(Objects::nonNull)
            .mapToInt(chapter -> DataUtil.isNullOrEmpty(chapter.getLessons()) ? 0 : chapter.getLessons().size())
            .sum();
    }

    default int totalTime(List<LessonChapter> chapters) {
        if (DataUtil.isNullOrEmpty(chapters)) return 0;
        return chapters.stream().filter(Objects::nonNull)
            .mapToInt(chapter ->
                DataUtil.defaultIfNull(chapter.getLessons(), new ArrayList<Lesson>())
                    .stream().filter(Objects::nonNull)
                    .mapToInt(lesson -> DataUtil.defaultIfNull(lesson.getDuration(), 0))
                    .sum()
            )
            .sum();
    }
}
