package com.e_learning.mapper;

import com.e_learning.dto.response.PhotoResponse;
import com.e_learning.entity.Photo;
import jakarta.annotation.PostConstruct;
import org.mapstruct.Mapper;
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

    public String toPhotoUrl(Photo photo) {
        if (photo == null) return null;
        return photo.getUrl();
    }

    public abstract Photo toEntity(PhotoResponse photoResponse);
    public abstract List<Photo> toLstEntity(List<PhotoResponse> lstPhotoResponse);
}
