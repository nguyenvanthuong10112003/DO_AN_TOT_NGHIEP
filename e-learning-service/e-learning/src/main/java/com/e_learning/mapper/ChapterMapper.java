package com.e_learning.mapper;

import com.e_learning.dto.ChapterDTO;
import com.e_learning.entity.LessonChapter;
import com.e_learning.helper.DataUtil;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Mapper(componentModel = "spring")
public abstract class ChapterMapper {
    @Mapping(target = "courseId", source = "chapter.course.id")
    @Mapping(target = "totalLesson", expression = "java(chapter.getLessons() == null ? 0 : chapter.getLessons().size())")
    @Mapping(target = "lessons", ignore = true)
    public abstract ChapterDTO toDTO(LessonChapter chapter);

    public List<ChapterDTO> toLstDTO(List<LessonChapter> chapters) {
        if (DataUtil.isNullOrEmpty(chapters)) return new ArrayList<>();
        List<ChapterDTO> lst = new ArrayList<>(chapters.stream().map(this::toDTO).toList());
        lst.sort(Comparator.comparing(ChapterDTO::getNumber));
        return lst;
    }
}
