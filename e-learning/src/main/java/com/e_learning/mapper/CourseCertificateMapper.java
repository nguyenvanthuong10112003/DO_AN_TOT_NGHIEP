package com.e_learning.mapper;

import com.e_learning.dto.request.CourseCertificateRequest;
import com.e_learning.dto.response.CourseCertificateResponse;
import com.e_learning.entity.CourseCertificate;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "spring")
public interface CourseCertificateMapper {
    @Mapping(target = "id", ignore = true)
    void update(@MappingTarget CourseCertificate certificate, CourseCertificateRequest request);

    CourseCertificateResponse toResponse(CourseCertificate entity);
}
