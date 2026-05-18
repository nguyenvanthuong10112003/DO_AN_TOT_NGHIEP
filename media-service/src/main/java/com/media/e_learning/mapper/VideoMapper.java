package com.media.e_learning.mapper;

import com.media.e_learning.dto.VideoResponse;
import com.media.e_learning.entity.Video;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface VideoMapper {
    VideoResponse toResponse(Video video);
}
