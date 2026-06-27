package com.media.service;

import com.media.common.Const;
import com.media.dto.StreamVideo;
import com.media.dto.VideoResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

public interface VideoService {
    VideoResponse uploadVideo(MultipartFile file, Boolean isTemp);
    StreamVideo getVideo(String sessionId, Const.Quality quality, String userId);
    void encodeVideo(String videoId);
    void activeVideo(Set<String> ids);
    void removeVideo(Set<String> ids);
}
