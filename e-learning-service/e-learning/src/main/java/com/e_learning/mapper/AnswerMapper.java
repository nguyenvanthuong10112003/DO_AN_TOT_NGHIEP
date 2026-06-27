package com.e_learning.mapper;

import com.e_learning.dto.AnswerDTO;
import com.e_learning.entity.QuestionAnswer;
import com.e_learning.helper.DataUtil;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Mapper(componentModel = "spring")
public abstract class AnswerMapper {
    @Mapping(target = "id", ignore = true)
    public abstract void update(@MappingTarget QuestionAnswer answer, AnswerDTO dto);

    @Mapping(target = "id", ignore = true)
    public abstract QuestionAnswer toEntity(AnswerDTO dto);

    public abstract AnswerDTO toDTO(QuestionAnswer answer);

    @Named("toLstAnswerDTO")
    public List<AnswerDTO> toLstDTO(List<QuestionAnswer> answers) {
        if (DataUtil.isNullOrEmpty(answers)) return new ArrayList<>();
        List<AnswerDTO> lst = new ArrayList<>(answers.stream().map(this::toDTO).toList());
        lst.sort(Comparator.comparing(AnswerDTO::getNumber));
        return lst;
    }

    public AnswerDTO toDTOLite(QuestionAnswer answer) {
        return AnswerDTO.builder()
            .id(answer.getId())
            .content(answer.getContent())
            .number(answer.getNumber())
            .build();
    }

    @Named("toLstAnswerDTOLite")
    public List<AnswerDTO> toLstDTOLite(List<QuestionAnswer> answers) {
        if (DataUtil.isNullOrEmpty(answers)) return new ArrayList<>();
        List<AnswerDTO> lst = new ArrayList<>(answers.stream().map(this::toDTOLite).toList());
        lst.sort(Comparator.comparing(AnswerDTO::getNumber));
        return lst;
    }
}
