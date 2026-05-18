package com.media.e_learning.common;

import lombok.Getter;

import java.util.List;

public final class Const {
    public static final class FfmpegProperties {
        public static final String FFMPEG_PATH = "ffmpeg";
        public static final int THUMBNAIL_SECOND = 1;
    }

    public static final class UploadProperties {
        private final String VIDEO_DIR = "./uploads/videos";
    }

    @Getter
    public enum Quality {
        _480p("480p", 480, 854),
        _720p("720p", 720, 1280),
        _1080p("1080p", 1080, 1920);
        Quality(String name, Integer height, Integer width) {
            this.name = name;
            this.height = height;
            this.width = width;
        }
        private final String name;
        private final Integer height;
        private final Integer width;

        public static Quality getQuality(Integer height) {
            return switch (height) {
                case 480 -> Quality._480p;
                case 720 -> Quality._720p;
                case 1080 -> Quality._1080p;
                default -> null;
            };
        }
    }
}