package com.e_learning.mapper;

import com.e_learning.dto.*;
import com.e_learning.entity.*;
import com.e_learning.helper.DataUtil;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Mapper(componentModel = "spring", uses = {LessonContentVideoMapper.class, LessonContentArticleMapper.class, LessonContentTestMapper.class})
public abstract class LessonMapper {
    @Autowired
    protected LessonContentVideoMapper lessonContentVideoMapper;

    @Autowired
    protected LessonContentArticleMapper lessonContentArticleMapper;

    @Autowired
    protected LessonContentTestMapper lessonContentTestMapper;

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "totalScore", ignore = true)
    public abstract void update(@MappingTarget Lesson lesson, LessonDTO dto);

    @Mapping(target = "id", ignore = true)
    public abstract Lesson toEntity(LessonDTO dto);

    @Mapping(target = "chapterId", source = "lesson.chapter.id")
    @Mapping(target = "article", expression = "java(mapArticle(lesson.getContent()))")
    @Mapping(target = "test", expression = "java(mapTest(lesson.getContent(), false))")
    @Mapping(target = "video", expression = "java(mapVideo(lesson.getContent()))")
    public abstract LessonDTO toDTO(Lesson lesson);

    @Mapping(target = "chapterId", source = "lesson.chapter.id")
    @Mapping(target = "article", ignore = true)
    @Mapping(target = "test", ignore = true)
    @Mapping(target = "video", ignore = true)
    public abstract LessonDTO toDTOClient(Lesson lesson);

    @Mapping(target = "chapterId", source = "lesson.chapter.id")
    @Mapping(target = "article", expression = "java(mapArticle(lesson.getContent()))")
    @Mapping(target = "test", expression = "java(mapTest(lesson.getContent(), true))")
    @Mapping(target = "video", expression = "java(mapVideo(lesson.getContent()))")
    public abstract LessonDTO toDTOLite(Lesson lesson);

    protected ContentVideoDTO mapVideo(LessonContent lessonContent) {
        if (!(lessonContent instanceof LessonContentVideo)) {
            return null;
        }

        return lessonContentVideoMapper.toDTO(
            (LessonContentVideo) lessonContent
        );
    }

    protected ContentArticleDTO mapArticle(LessonContent lessonContent) {
        if (!(lessonContent instanceof LessonContentArticle)) {
            return null;
        }

        return lessonContentArticleMapper.toDTO(
            (LessonContentArticle) lessonContent
        );
    }

    protected ContentTestDTO mapTest(LessonContent lessonContent, boolean isLite) {
        if (!(lessonContent instanceof LessonContentTest)) {
            return null;
        }

        return isLite ?
            lessonContentTestMapper.toDTOLite((LessonContentTest) lessonContent) :
            lessonContentTestMapper.toDTO((LessonContentTest) lessonContent);
    }

    public List<LessonDTO> toLstDTO(List<Lesson> lessons) {
        if (DataUtil.isNullOrEmpty(lessons)) return new ArrayList<>();
        List<LessonDTO> lst = new ArrayList<>(lessons.stream().map(this::toDTO).toList());
        lst.sort(Comparator.comparing(LessonDTO::getNumber));
        return lst;
    }

    public List<LessonDTO> toLstDTOClient(List<Lesson> lessons) {
        if (DataUtil.isNullOrEmpty(lessons)) return new ArrayList<>();
        List<LessonDTO> lst = new ArrayList<>(lessons.stream().map(this::toDTOClient).toList());
        lst.sort(Comparator.comparing(LessonDTO::getNumber));
        return lst;
    }

    public List<LessonDTO> toLstDTOLite(List<Lesson> lessons) {
        if (DataUtil.isNullOrEmpty(lessons)) return new ArrayList<>();
        List<LessonDTO> lst = new ArrayList<>(lessons.stream().map(this::toDTOLite).toList());
        lst.sort(Comparator.comparing(LessonDTO::getNumber));
        return lst;
    }
}
