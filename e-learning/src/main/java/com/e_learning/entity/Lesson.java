package com.e_learning.entity;

import com.e_learning.common.Const;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "lesson")
@Builder
@Data
public class Lesson extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String name;
    private String description;
    @Enumerated(EnumType.STRING)
    private Const.LessonType type;
    @OneToOne(mappedBy = "lesson", cascade = CascadeType.ALL)
    private LessonContent content;
    @ManyToOne
    @JoinColumn(name = "chapter_id")
    private LessonChapter chapter;
    private Long duration;
    private Long maxScore;
    private Long passScore;
    private Boolean requireFinish;
    private Boolean canPreview;
    @OneToOne
    @JoinColumn(name = "after_of_id")
    private Lesson afterOf;
}
