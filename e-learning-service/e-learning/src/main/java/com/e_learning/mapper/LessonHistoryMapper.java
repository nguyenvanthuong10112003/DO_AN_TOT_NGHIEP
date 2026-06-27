package com.e_learning.mapper;

import com.e_learning.dto.ProgressDTO;
import com.e_learning.entity.LessonProgress;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface LessonHistoryMapper {
    ProgressDTO toDTO(LessonProgress history);
}
