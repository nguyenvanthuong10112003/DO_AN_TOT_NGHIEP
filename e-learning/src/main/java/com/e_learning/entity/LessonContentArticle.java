package com.e_learning.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "lesson_article")
@Entity
public class LessonContentArticle extends LessonContent {
    private Integer abc;
}
