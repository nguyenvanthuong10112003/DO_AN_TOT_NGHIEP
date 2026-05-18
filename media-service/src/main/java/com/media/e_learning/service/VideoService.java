package com.media.e_learning.service;

import com.media.e_learning.common.Const;
import com.media.e_learning.dto.StreamVideo;
import com.media.e_learning.dto.VideoResponse;
import com.media.e_learning.entity.Photo;
import org.springframework.core.io.InputStreamResource;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;

public interface VideoService {
    VideoResponse uploadVideo(MultipartFile file, Boolean isTemp);
    StreamVideo getVideo(String sessionId, Const.Quality quality, String userId);
    void encodeVideo(String videoId);
}
