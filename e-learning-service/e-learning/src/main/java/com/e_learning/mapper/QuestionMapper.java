package com.e_learning.mapper;

import com.e_learning.dto.LessonDTO;
import com.e_learning.dto.QuestionDTO;
import com.e_learning.entity.Lesson;
import com.e_learning.entity.Question;
import com.e_learning.helper.DataUtil;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Mapper(componentModel = "spring", uses = {AnswerMapper.class})
public abstract class QuestionMapper {
    @Autowired
    private AnswerMapper answerMapper;
    @Mapping(target = "id", ignore = true)
    public abstract void update(@MappingTarget Question question, QuestionDTO dto);
    @Mapping(target = "id", ignore = true)
    public abstract Question toEntity(QuestionDTO dto);

    @Mapping(target = "answers", source = "question.answers", qualifiedByName = "toLstAnswerDTO")
    public abstract QuestionDTO toDTO(Question question);

    @Named("toLstQuestionDTO")
    public List<QuestionDTO> toLstDTO(List<Question> questions) {
        if (DataUtil.isNullOrEmpty(questions)) return new ArrayList<>();
        List<QuestionDTO> lst = new ArrayList<>(questions.stream().map(this::toDTO).toList());
        lst.sort(Comparator.comparing(QuestionDTO::getNumber));
        return lst;
    }

    @Mapping(target = "answers", source = "question.answers", qualifiedByName = "toLstAnswerDTOLite")
    public abstract QuestionDTO toDTOLite(Question question);

    @Named("toLstQuestionDTOLite")
    public List<QuestionDTO> toLstDTOLite(List<Question> questions) {
        if (DataUtil.isNullOrEmpty(questions)) return new ArrayList<>();
        List<QuestionDTO> lst = new ArrayList<>(questions.stream().map(this::toDTOLite).toList());
        lst.sort(Comparator.comparing(QuestionDTO::getNumber));
        return lst;
    }
}
