package com.e_learning.mapper;

import com.e_learning.dto.request.CourseCertificateRequest;
import com.e_learning.entity.CourseCertificate;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "spring")
public abstract class CourseCertificateMapper {
    public CourseCertificateRequest parseToObject(String json) {
        ObjectMapper mapper = new ObjectMapper();

        try {
            CourseCertificateRequest dto = mapper.readValue(json, CourseCertificateRequest.class);
        } catch (JsonProcessingException ignored) {}

        return null;
    }

    @Mapping(target = "id", ignore = true)
    public abstract void update(@MappingTarget CourseCertificate certificate, CourseCertificateRequest request);
}
