package com.e_learning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "lesson_article")
@Entity
@SuperBuilder
public class LessonContentArticle extends LessonContent {
    @Column(columnDefinition = "text", nullable = false)
    private String content;

    @ManyToMany(cascade = {CascadeType.MERGE,CascadeType.PERSIST}, fetch = FetchType.EAGER)
    private List<Photo> photos;
}
