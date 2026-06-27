package com.e_learning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Entity
@Table(name = "lesson_question")
public class LessonQuestionHistory extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String questionId;
    @Column(nullable = false)
    private String answerId;
    private String answer;
    @ManyToOne
    @JoinColumn(name = "test_history_id", nullable = false)
    @SQLRestriction("status = 1")
    private LessonTestHistory testHistory;
}
