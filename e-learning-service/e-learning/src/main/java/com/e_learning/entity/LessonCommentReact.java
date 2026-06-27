package com.e_learning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

@AllArgsConstructor
@NoArgsConstructor
@Data
@SuperBuilder
@Table(name = "react")
@Entity
public class LessonCommentReact extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sender_id", nullable = false)
    @SQLRestriction("status = 1")
    private User sender;

    @ManyToOne
    @JoinColumn(name = "comment_id", nullable = false)
    @SQLRestriction("status = 1")
    private LessonComment comment;
}
