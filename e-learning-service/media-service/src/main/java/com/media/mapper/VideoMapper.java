package com.media.mapper;

import com.media.dto.VideoResponse;
import com.media.entity.Video;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface VideoMapper {
    VideoResponse toResponse(Video video);
}
