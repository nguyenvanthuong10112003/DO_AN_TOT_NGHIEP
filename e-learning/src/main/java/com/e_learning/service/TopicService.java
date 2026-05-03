package com.e_learning.service;

import com.e_learning.dto.response.TopicResponse;
import com.e_learning.entity.CourseSector;
import com.e_learning.entity.CourseTopic;

import java.util.List;

public interface TopicService {
    List<TopicResponse> findAllBySector(String sectorId);
    CourseTopic create(String topicName, CourseSector sector);
}
