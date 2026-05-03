package com.e_learning.service;

import com.e_learning.dto.response.SectorResponse;
import com.e_learning.entity.CourseSector;

import java.util.List;

public interface SectorService {
    List<SectorResponse> getAllSector();
    CourseSector create(String sectorName);
}
