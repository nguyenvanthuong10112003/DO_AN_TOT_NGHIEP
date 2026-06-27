package com.e_learning.mapper;

import com.e_learning.dto.VideoDTO;
import com.e_learning.entity.Video;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface VideoMapper {
    void update(@MappingTarget Video video, VideoDTO videoDTO);
    Video toEntity(VideoDTO dto);
    VideoDTO toDTO(Video entity);
}
