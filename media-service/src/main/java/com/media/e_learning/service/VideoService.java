package com.media.e_learning.service;

import com.media.e_learning.dto.VideoResponse;
import org.springframework.core.io.InputStreamResource;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;

public interface VideoService {
    VideoResponse uploadVideo(String name, MultipartFile file);
    File getVideo(String sessionId, String userId);
}
