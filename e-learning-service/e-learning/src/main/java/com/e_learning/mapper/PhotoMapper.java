package com.e_learning.mapper;

import com.e_learning.dto.PhotoDTO;
import com.e_learning.entity.Photo;
import org.mapstruct.Mapper;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;

@Mapper(componentModel = "spring")
public abstract class PhotoMapper {
    @Value("${server.domain}")
    private String domain;
    @Value("${server.servlet.context-path}")
    private String contextPath;

    @Named("toPhotoUrl")
    public String toPhotoUrl(Photo photo) {
        if (photo == null) return null;
        return photo.getUrl();
    }

    public abstract Photo toEntity(PhotoDTO photoDTO);
    public abstract List<Photo> toLstEntity(List<PhotoDTO> lstPhotoDTO);
}
