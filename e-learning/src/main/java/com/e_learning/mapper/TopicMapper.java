package com.e_learning.mapper;

import com.e_learning.dto.response.TopicResponse;
import com.e_learning.entity.CourseTopic;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TopicMapper {
    TopicResponse toResponse(CourseTopic topic);
    List<TopicResponse> toLstResponse(List<CourseTopic> topics);
}
