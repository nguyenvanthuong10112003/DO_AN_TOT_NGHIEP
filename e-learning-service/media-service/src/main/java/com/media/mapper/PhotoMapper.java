package com.media.mapper;

import com.media.dto.PhotoResponse;
import com.media.entity.Photo;
import com.media.entity.PhotoData;
import jakarta.annotation.PostConstruct;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Mapper(componentModel = "spring")
public abstract class PhotoMapper {
    @Value("${server.domain}")
    private String domain;
    @Value("${server.servlet.context-path}")
    private String contextPath;
    private String baseUrl;
    @PostConstruct
    public void init() {
        baseUrl = String.format("%s%s/photos/", domain, contextPath);
    }

    public String toPhotoUrl(Photo photo) {
        if (photo == null) return null;
        return baseUrl + photo.getId();
    }

    @Mapping(target = "url", expression = "java(toPhotoUrl(photo))")
    public abstract PhotoResponse toResponse(Photo photo);
    public abstract List<PhotoResponse> toListResponse(List<Photo> photo);
    public abstract Photo clone(Photo photo);
    public abstract PhotoData clone(PhotoData photoData);
}
