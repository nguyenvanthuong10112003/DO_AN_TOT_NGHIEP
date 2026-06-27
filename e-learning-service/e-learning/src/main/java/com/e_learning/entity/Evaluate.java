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
@Table
@Entity
@SuperBuilder
public class Evaluate extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String message;

    @Column(nullable = false)
    private Integer starNo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sender_id", nullable = false)
    @SQLRestriction("status = 1")
    private User sender;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    @SQLRestriction("status = 1")
    private Course course;
}