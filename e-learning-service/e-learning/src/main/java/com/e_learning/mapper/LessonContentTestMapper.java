package com.e_learning.mapper;

import com.e_learning.dto.ContentTestDTO;
import com.e_learning.entity.LessonContentTest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {QuestionMapper.class})
public interface LessonContentTestMapper {
    @Mapping(target = "questions", source = "entity.questions", qualifiedByName = "toLstQuestionDTO")
    ContentTestDTO toDTO(LessonContentTest entity);
    @Mapping(target = "questions", source = "entity.questions", qualifiedByName = "toLstQuestionDTOLite")
    ContentTestDTO toDTOLite(LessonContentTest entity);
}
