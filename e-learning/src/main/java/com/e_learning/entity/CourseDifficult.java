package com.e_learning.entity;

import lombok.Getter;

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