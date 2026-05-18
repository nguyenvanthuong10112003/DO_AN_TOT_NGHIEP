package com.e_learning.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
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
}