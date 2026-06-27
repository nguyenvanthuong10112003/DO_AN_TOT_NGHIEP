package com.e_learning.entity;

import com.e_learning.common.Const;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "lesson")
@SuperBuilder
@Data
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
public class Lesson extends BaseEntity {
    @EqualsAndHashCode.Include
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "varchar(300)", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Const.LessonType type;

    @OneToOne(mappedBy = "lesson", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @SQLRestriction("status = 1")
    private LessonContent content;

    @ManyToOne(cascade = CascadeType.PERSIST)
    @JoinColumn(name = "chapter_id", nullable = false)
    @SQLRestriction("status = 1")
    private LessonChapter chapter;

    @Column(nullable = false)
    private Integer duration;

    private Double totalScore;

    private Double passScore;

    private Boolean requireFinish;

    private Boolean canPreview;

    @Column(nullable = false)
    private Integer number;

    private Boolean isMix;

    private Boolean showAnswer;

    @Enumerated(EnumType.STRING)
    private Const.ScoringMode scoringMode;

    @OneToMany(fetch = FetchType.LAZY)
    @SQLRestriction("status = 1")
    private List<LessonProgress> histories;
}
