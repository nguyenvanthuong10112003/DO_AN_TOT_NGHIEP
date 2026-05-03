package com.e_learning.helper;

import com.e_learning.entity.Role;
import com.e_learning.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Field;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.regex.Pattern;

@Slf4j
public final class DataUtil {
    private static final String LOWER = "abcdefghijklmnopqrstuvwxyz";
    private static final String UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String DIGIT = "0123456789";
    private static final String SPECIAL = "!@#$%^&*()-_=+<>?";
    private static final String ALL = LOWER + UPPER + DIGIT + SPECIAL;
    private static final SecureRandom random = new SecureRandom();
    public static LocalDateTime now() {
        return LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
    }
    public static <T> T defaultIfNull(T value, T defaultValue) {
        return value == null ? defaultValue : value;
    }
    public static boolean boolValue(Boolean bool) {
       return bool != null && bool;
    }
    public static Date plusSeconds(Date date, long seconds) {
        if (date == null) return null;
        Instant instant = date.toInstant();
        Instant newInstant = instant.plusSeconds(seconds);
        return Date.from(newInstant);
    }
    public static MultipartFile convertImageUrlToMultipartFile(String imageUrl) throws IOException {

        URL url = new URL(imageUrl);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();

        connection.setConnectTimeout(5000);
        connection.setReadTimeout(5000);
        connection.setRequestMethod("GET");

        String contentType = connection.getContentType();

        if (contentType == null || !contentType.startsWith("image")) {
            throw new RuntimeException("URL is not an image");
        }

        InputStream inputStream = connection.getInputStream();

        byte[] bytes = inputStream.readAllBytes();

        String fileName = "image." + contentType.split("/")[1];

        return new CustomMultipartFile(fileName, fileName, contentType, bytes);
    }
    public static LocalDateTime toLocalDateTime(Instant instant) {
        return LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
    }
    public static LocalDateTime toLocalDateTime(Object object, String pattern) {
        return toLocalDateTime(String.valueOf(object), pattern);
    }
    public static LocalDateTime toLocalDateTime(String str, String pattern) {
        if (str == null || str.isBlank()) {
            return null;
        }
        if (pattern == null || pattern.isBlank()) {
            return null;
        }
        if (str.length() > pattern.length())
            str = str.substring(0, pattern.length());
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
            return LocalDateTime.parse(str, formatter);
        } catch (Exception ignored) {}
        return null;
    }
    public static boolean isNullOrEmpty(Collection<?> collection) {
        return collection == null || collection.isEmpty();
    }
    private static final String USERNAME_PATTERN = "[a-zA-Z0-9]{3,30}";
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
    "^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$"
    );

    public static boolean isEmailValid(String email) {
        if (email == null || email.isBlank()) return false;
        return EMAIL_PATTERN.matcher(email).matches();
    }

    public static boolean isUsernameValid(String username) {
        if (username == null || username.isBlank()) return false;
        return username.matches(USERNAME_PATTERN);
    }

    public static boolean equals(Object o1, Object o2) {
        if (o1 == o2) return true;
        if (o1 == null || o2 == null) return false;
        return o1.equals(o2);
    }

    public static String trim(String s) {return s == null ? null : s.trim();}
    public static String generateCode(int length) {
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < length; i++) {
            code.append(random.nextInt(10)); // 0-9
        }
        return code.toString();
    }

    public static String formatDateTime(LocalDateTime dateTime, String pattern) {
        if (dateTime == null) return "";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
        return dateTime.format(formatter);
    }

    public static String generateRandomPassword(int length) {
        if (length < 8) {
            throw new IllegalArgumentException("Password length must be at least 8");
        }

        StringBuilder password = new StringBuilder();

        // đảm bảo có ít nhất 1 ký tự mỗi loại
        password.append(LOWER.charAt(random.nextInt(LOWER.length())));
        password.append(UPPER.charAt(random.nextInt(UPPER.length())));
        password.append(DIGIT.charAt(random.nextInt(DIGIT.length())));
        password.append(SPECIAL.charAt(random.nextInt(SPECIAL.length())));

        // phần còn lại random
        for (int i = 4; i < length; i++) {
            password.append(ALL.charAt(random.nextInt(ALL.length())));
        }

        // shuffle để tránh predictable
        return shuffle(password.toString());
    }

    private static String shuffle(String input) {
        char[] array = input.toCharArray();
        for (int i = array.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return new String(array);
    }
}
