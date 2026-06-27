package com.e_learning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "lesson_video")
@Entity
@SuperBuilder
public class LessonContentVideo extends LessonContent {
    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "video_id", nullable = false)
    @SQLRestriction("status = 1")
    private Video videoInfo;

    @Column(nullable = false)
    private Integer qualityDefault;

    @Column(columnDefinition = "varchar(300)", nullable = false)
    private String summary;
}