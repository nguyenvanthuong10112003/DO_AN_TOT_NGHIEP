package com.e_learning.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

public final class Const {
    public static final Integer STATUS_ACTIVE = 1;
    public static final Integer STATUS_INACTIVE = 0;
    public static final String ADMIN_ACCOUNT_USERNAME = "admin";
    public static final String ADMIN_ACCOUNT_PASSWORD = "admin";
    public static final String ADMIN_ACCOUNT_FULL_NAME = "admin";
    public static final String TEMPLATE_SEND_EMAIL_CONTENT = "EmailContentTemplate.html";
    public static final String FORMAT_DATETIME_PATTERN_DD_MM_YYYY_HH_MM_SS = "dd/MM/yyyy HH:mm:ss";

    public enum LessonType {
        ARTICLE, // bài viết
        VIDEO, // video
        TEST, // bài kiểm tra
    }

    @Getter
    public enum CourseDifficult {
        BASIC(1L),
        INTERMEDIATE(2L),
        ADVANCED(3L),
        EXPERT(4L);

        CourseDifficult(Long level) {
            this.level = level;
        }
        private final Long level;
    }

    public enum CourseLanguage {
        VI,
        EN
    }

    public enum CourseType {
        FREE,
        PAID
    }

    @AllArgsConstructor
    @Getter
    public enum Role {
        ADMIN("ADMIN", "Role admin"),
        USER("USER", "Role user")
        ;
        private final String name;
        private final String description;
    }
}
