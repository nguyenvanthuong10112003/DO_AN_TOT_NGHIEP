package com.e_learning.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Entity
@Table(name = "chapter")
@Data
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
public class LessonChapter extends BaseEntity {
    @EqualsAndHashCode.Include
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    @SQLRestriction("status = 1")
    private Course course;

    @OneToMany(mappedBy = "chapter", cascade = {CascadeType.MERGE, CascadeType.PERSIST}, fetch = FetchType.LAZY)
    @SQLRestriction("status = 1")
    @OrderBy("number ASC")
    private List<Lesson> lessons;

    @Column(nullable = false)
    private Integer number;

    private Integer totalTime;
}
