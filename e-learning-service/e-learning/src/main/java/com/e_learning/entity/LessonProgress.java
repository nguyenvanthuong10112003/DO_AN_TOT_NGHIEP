package com.e_learning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.List;

@Table(name = "progress")
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class LessonProgress extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @SQLRestriction("status = 1")
    private User user;

    @ManyToOne
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    private LocalDateTime finishTime;

    private Boolean isDone;

    @OneToMany(mappedBy = "progress")
    @SQLRestriction("status = 1")
    @OrderBy("createdTime")
    private List<LessonTestHistory> testHistories;
}
