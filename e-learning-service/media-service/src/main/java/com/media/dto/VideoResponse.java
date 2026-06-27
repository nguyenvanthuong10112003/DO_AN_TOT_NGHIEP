package com.media.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpHeaders;

import java.io.InputStream;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VideoResponse {
    private String id;
    private String url;
    private Boolean isActive;
    private Integer width;
    private Integer height;
    private Double duration;
    private Integer quality;
    @JsonIgnore
    private HttpHeaders headers;
    @JsonIgnore
    private Long contentLength;
    @JsonIgnore
    private InputStream inputStream;
}