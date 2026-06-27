package com.e_learning.mapper;

import com.e_learning.dto.ContentArticleDTO;
import com.e_learning.entity.LessonContentArticle;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface LessonContentArticleMapper {
    ContentArticleDTO toDTO(LessonContentArticle entity);
}
