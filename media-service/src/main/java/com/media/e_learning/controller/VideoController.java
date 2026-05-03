package com.media.e_learning.controller;

import com.media.e_learning.dto.ResponseApi;
import com.media.e_learning.dto.SessionCreateRequest;
import com.media.e_learning.dto.SessionResponse;
import com.media.e_learning.dto.VideoResponse;
import com.media.e_learning.service.SessionService;
import com.media.e_learning.service.VideoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import java.io.*;

@RequestMapping("/videos")
@RestController
public class VideoController {

    @Autowired
    private VideoService videoService;

    @Autowired
    private SessionService sessionService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VideoResponse> uploadVideo(
            @RequestParam("name") String name,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(videoService.uploadVideo(name, file));
    }

    @GetMapping("/view")
    public ResponseEntity<InputStreamResource> streamVideo(
            @RequestParam String sessionId,
            @RequestParam String userId,
            @RequestHeader(value = "Range", required = false) String rangeHeader
    ) throws IOException {

        File videoFile = videoService.getVideo(sessionId, userId);
        long fileSize = videoFile.length();

        // ================== NO RANGE ==================
        if (rangeHeader == null) {
            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("video/mp4"))
                .contentLength(fileSize)
                .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                .body(new InputStreamResource(new BufferedInputStream(new FileInputStream(videoFile))));
        }

        // ================== PARSE RANGE ==================
        String rangeValue = rangeHeader.replace("bytes=", "");
        String[] ranges = rangeValue.split("-");

        long start = Long.parseLong(ranges[0]);
        long end = (ranges.length > 1 && !ranges[1].isEmpty())
                ? Long.parseLong(ranges[1])
                : fileSize - 1;

        // validate
        if (end >= fileSize) {
            end = fileSize - 1;
        }

        long contentLength = end - start + 1;

        // ================== OPEN STREAM ==================
        FileInputStream fis = new FileInputStream(videoFile);

        // skip chuẩn (fix warning + đảm bảo đúng byte)
        long skipped = 0;
        while (skipped < start) {
            long skip = fis.skip(start - skipped);
            if (skip <= 0) break;
            skipped += skip;
        }

        // ================== LIMIT STREAM ==================
        InputStream limitedStream = new BufferedInputStream(fis) {
            private long remaining = contentLength;

            @Override
            public int read(byte[] b, int off, int len) throws IOException {
                if (remaining <= 0) return -1;

                len = (int) Math.min(len, remaining);
                int read = super.read(b, off, len);

                if (read > 0) remaining -= read;
                return read;
            }

            @Override
            public int read() throws IOException {
                if (remaining <= 0) return -1;

                int data = super.read();
                if (data != -1) remaining--;
                return data;
            }
        };

        // ================== HEADERS ==================
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_RANGE, "bytes " + start + "-" + end + "/" + fileSize);
        headers.add(HttpHeaders.ACCEPT_RANGES, "bytes");
        headers.add(HttpHeaders.CONTENT_LENGTH, String.valueOf(contentLength));
        headers.add(HttpHeaders.CONTENT_TYPE, "video/mp4");

        return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                .headers(headers)
                .body(new InputStreamResource(limitedStream));
    }

    @PostMapping("create-session")
    public ResponseApi<SessionResponse> createSession(@RequestBody SessionCreateRequest request) {
        return ResponseApi.createSuccess(sessionService.createSession(request));
    }
}