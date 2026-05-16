package com.e_learning.mapper;

import com.e_learning.dto.response.TopicResponse;
import com.e_learning.entity.CourseTopic;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TopicMapper {
    @Mapping(target = "sectorId", source = "topic.sector.id")
    TopicResponse toResponse(CourseTopic topic);
    List<TopicResponse> toLstResponse(List<CourseTopic> topics);
}
