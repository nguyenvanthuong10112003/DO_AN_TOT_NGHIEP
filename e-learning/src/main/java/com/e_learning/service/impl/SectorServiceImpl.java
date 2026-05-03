package com.e_learning.service.impl;

import com.e_learning.common.Const;
import com.e_learning.dto.response.SectorResponse;
import com.e_learning.entity.CourseItem;
import com.e_learning.entity.CourseSector;
import com.e_learning.mapper.SectorMapper;
import com.e_learning.repository.SectorRepository;
import com.e_learning.service.SectorService;
import org.apache.logging.log4j.util.Strings;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SectorServiceImpl implements SectorService {
    @Autowired
    private SectorRepository sectorRepository;
    @Autowired
    private SectorMapper sectorMapper;
    @Override
    public List<SectorResponse> getAllSector() {
        List<CourseSector> sectors = sectorRepository.findAllByStatus(Const.STATUS_ACTIVE);
        return sectorMapper.toLstResponse(sectors);
    }
    @Override
    @Transactional(rollbackFor = Exception.class)
    public CourseSector create(String sectorName) {
        if (Strings.isBlank(sectorName))
            throw new RuntimeException("Sector name is required");
        if (sectorRepository.existsByNameAndStatus(sectorName, Const.STATUS_ACTIVE))
            throw new RuntimeException("Sector " + sectorName + " already existed");

        CourseSector courseSector = CourseSector.builder()
            .name(sectorName)
            .build();

        return sectorRepository.save(courseSector);
    }
}


