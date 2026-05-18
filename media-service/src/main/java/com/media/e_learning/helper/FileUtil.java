package com.media.e_learning.helper;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.media.e_learning.common.Const;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;

public class FileUtil {
    public static VideoInfo getVideoInfo(Path videoPath)
            throws IOException, InterruptedException {
        ObjectMapper objectMapper = new ObjectMapper();

        ProcessBuilder pb = new ProcessBuilder(
                "ffprobe",
                "-v", "error",
                "-show_streams",
                "-show_format",
                "-print_format", "json",
                videoPath.toString()
        );

        Process process = pb.start();

        String json = new String(
                process.getInputStream().readAllBytes(),
                StandardCharsets.UTF_8
        );

        int exitCode = process.waitFor();

        if (exitCode != 0) {
            throw new RuntimeException("Cannot read video metadata");
        }

        JsonNode root = objectMapper.readTree(json);

        boolean hasSubtitle = false;

        Integer width = null;
        Integer height = null;

        Double duration = null;

        for (JsonNode stream : root.get("streams")) {

            String codecType = stream.path("codec_type").asText();

            if ("video".equals(codecType)) {

                width = stream.path("width").asInt();
                height = stream.path("height").asInt();

            } else if ("subtitle".equals(codecType)) {

                hasSubtitle = true;
            }
        }

        JsonNode format = root.path("format");

        if (format.has("duration")) {
            duration = format.path("duration").asDouble();
        }

        return VideoInfo.builder()
                .width(width)
                .height(height)
                .duration(duration)
                .quality(getQuality(height))
                .hasSubtitle(hasSubtitle)
                .build();
    }

    private static String getQuality(Integer height) {
        if (height >= Const.Quality._1080p.getHeight()) {
            return Const.Quality._1080p.getName();
        }

        if (height >= Const.Quality._720p.getHeight()) {
            return Const.Quality._720p.getName();
        }

        return Const.Quality._480p.getName();
    }
}
