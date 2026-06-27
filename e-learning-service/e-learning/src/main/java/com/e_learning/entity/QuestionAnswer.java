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
@SuperBuilder
@Entity
@Table(name = "answer")
public class QuestionAnswer extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String content;

    private Boolean isCorrect;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    @SQLRestriction("status = 1")
    private Question question;

    @Column(nullable = false)
    private Integer number;
}
