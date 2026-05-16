package com.e_learning.service.impl;

import com.e_learning.common.Const;
import com.e_learning.dto.response.TopicResponse;
import com.e_learning.entity.CourseSector;
import com.e_learning.entity.CourseTopic;
import com.e_learning.mapper.TopicMapper;
import com.e_learning.repository.TopicRepository;
import com.e_learning.service.TopicService;
import org.apache.logging.log4j.util.Strings;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TopicServiceImpl implements TopicService {
    @Autowired
    private TopicRepository topicRepository;
    @Autowired
    private TopicMapper topicMapper;
    @Override
    public List<TopicResponse> findAll(String sectorId) {
        List<CourseTopic> search = null;
        if (!Strings.isBlank(sectorId))
            search = topicRepository.findAllActiveBySectorId(sectorId);
        else
            search = topicRepository.findAllActive();
        return topicMapper.toLstResponse(search);
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public CourseTopic create(String topicName, CourseSector sector) {
        if (sector == null)
            throw new RuntimeException("Sector is required");
        if (Strings.isBlank(topicName))
            throw new RuntimeException("Topic name is required");
        if (topicRepository.existsByNameAndSectorIdAndStatus(topicName, sector.getId(), Const.STATUS_ACTIVE))
            throw new RuntimeException("Topic " + topicName + " already existed");

        CourseTopic courseTopic = CourseTopic.builder()
                .name(topicName)
                .sector(sector)
                .build();

        return topicRepository.save(courseTopic);
    }
}
