package com.media.e_learning.dto;

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
    private String name;
    private String url;
    @JsonIgnore
    private HttpHeaders headers;
    @JsonIgnore
    private Long contentLength;
    @JsonIgnore
    private InputStream inputStream;
}