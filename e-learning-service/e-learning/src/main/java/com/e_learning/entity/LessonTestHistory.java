package com.e_learning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "test_history")
public class LessonTestHistory extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "progress_id", nullable = false)
    @SQLRestriction("status = 1")
    private LessonProgress progress;
    private Double score;
    private LocalDateTime expireAt;
    private LocalDateTime submitAt;
    private Boolean isPass;
    @OneToMany(fetch = FetchType.LAZY)
    @OrderBy("createdTime")
    @SQLRestriction("status = 1")
    private List<LessonQuestionHistory> questionHistories;
}
