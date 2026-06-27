package com.media.controller;

import com.media.common.Const;
import com.media.dto.*;
import com.media.dto.*;
import com.media.service.SessionService;
import com.media.service.VideoService;
import com.media.validator.video.VideoConstraint;
import jakarta.validation.constraints.NotNull;
import lombok.extern.slf4j.Slf4j;
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
import org.springframework.web.server.ResponseStatusException;

import java.io.*;

@Slf4j
@RequestMapping("/videos")
@RestController
public class VideoController {

    @Autowired
    private VideoService videoService;

    @Autowired
    private SessionService sessionService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VideoResponse> uploadVideo(
            @RequestParam("file") @NotNull @VideoConstraint MultipartFile file,
            @RequestParam(required = false) Boolean isTemp) {
        return ResponseEntity.ok(videoService.uploadVideo(file, isTemp));
    }

    @GetMapping(value = "/play")
    public ResponseEntity<?> streamVideo(
            @RequestParam String sessionId,
            @RequestParam(required = false) Const.Quality quality,
            @RequestParam String userId,
            @RequestHeader(value = "Range", required = false) String rangeHeader
    ) throws IOException {

        try {
            StreamVideo response = videoService.getVideo(sessionId, quality, userId);
            File videoFile = response.getFile();
            long fileSize = videoFile.length();

            // ================== NO RANGE ==================
            if (rangeHeader == null || rangeHeader.isBlank()) {
                rangeHeader = "bytes=0-";
            }

            // ================== PARSE RANGE ==================
            String rangeValue = rangeHeader.replace("bytes=", "");
            String[] ranges = rangeValue.split("-");

            long start = Long.parseLong(ranges[0]);

            long chunkSize = 1024 * 1024 * 5; // cho lay 5MB 1 request
            long end = Math.min(start + chunkSize - 1, fileSize - 1);

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
        } catch (Exception e) {
            log.error(e.getMessage());
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
    }

    private String htmlResponseVideoError(String msg) {
        return """
                    <html>
                      <body style="
                            background:black;
                            color:white;
                            display:flex;
                            justify-content:center;
                            align-items:center;
                            height:100vh;
                            margin:0;
                            font-family:Arial;
                      ">
                          <h2>%s</h2>
                      </body>
                    </html>
                """.formatted(msg);
    }

    @PostMapping("create-session")
    public ResponseApi<SessionResponse> createSession(@RequestBody SessionCreateRequest request) {
        return ResponseApi.createSuccess(sessionService.createSession(request));
    }
}