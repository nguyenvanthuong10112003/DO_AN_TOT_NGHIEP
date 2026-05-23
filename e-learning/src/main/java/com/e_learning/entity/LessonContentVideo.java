package com.e_learning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "lesson_video")
@Entity
public class LessonContentVideo extends LessonContent {
    @OneToOne
    @JoinColumn(name = "video_id")
    private Video video;
    @Column(columnDefinition = "varchar(300)")
    private String qualityDefault;
    private String summary;
}