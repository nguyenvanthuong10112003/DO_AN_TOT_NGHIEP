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
@Table(name = "comment")
@Entity
@SuperBuilder
public class LessonComment extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String message;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sender_id", nullable = false)
    @SQLRestriction("status = 1")
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    @SQLRestriction("status = 1")
    private LessonComment parent;

    @OneToMany(fetch = FetchType.EAGER, mappedBy = "parent")
    @SQLRestriction("status = 1")
    private List<LessonComment> children;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "comment")
    @SQLRestriction("status = 1")
    @OrderBy("createdTime")
    private List<LessonCommentReact> reacts;
}
