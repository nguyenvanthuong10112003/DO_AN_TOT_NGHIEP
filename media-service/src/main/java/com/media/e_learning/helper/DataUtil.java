package com.media.e_learning.helper;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.ZoneId;

public class DataUtil {
    public static LocalDateTime now() {
        return LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
    }
    public static <T> T defaultIfNull(T value, T defaultValue) {
        return value == null ? defaultValue : value;
    }
    public static boolean boolValue(Boolean bool) {
       return bool != null && bool;
    }
}
