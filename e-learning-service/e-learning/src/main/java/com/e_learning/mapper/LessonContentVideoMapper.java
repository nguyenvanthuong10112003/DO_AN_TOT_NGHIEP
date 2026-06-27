package com.e_learning.mapper;

import com.e_learning.dto.ContentVideoDTO;
import com.e_learning.entity.LessonContentVideo;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface LessonContentVideoMapper {
    @Mapping(target = "id", ignore = true)
    void update(@MappingTarget LessonContentVideo contentVideo, ContentVideoDTO dto);
    @Mapping(target = "id", ignore = true)
    LessonContentVideo toEntity(ContentVideoDTO dto);
    ContentVideoDTO toDTO(LessonContentVideo entity);
}
