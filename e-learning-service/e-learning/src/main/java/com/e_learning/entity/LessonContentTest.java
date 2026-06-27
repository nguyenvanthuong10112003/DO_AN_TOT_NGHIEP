package com.e_learning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "lesson_test")
@Entity
@SuperBuilder
public class LessonContentTest extends LessonContent {
    @OneToMany(mappedBy = "test", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @SQLRestriction("status = 1")
    @OrderBy("number ASC")
    private List<Question> questions;
}