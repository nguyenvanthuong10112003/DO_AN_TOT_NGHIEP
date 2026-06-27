package com.e_learning.mapper;

import com.e_learning.dto.response.SectorResponse;
import com.e_learning.entity.CourseSector;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SectorMapper {
    SectorResponse toResponse(CourseSector sector);
    List<SectorResponse> toLstResponse(List<CourseSector> sectors);
}
