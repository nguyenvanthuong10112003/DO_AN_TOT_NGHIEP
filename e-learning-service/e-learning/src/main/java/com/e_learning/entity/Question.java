package com.e_learning.entity;

import com.e_learning.common.Const;
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
@SuperBuilder
@Table
@Entity
public class Question extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(columnDefinition = "text")
    private String content;

    @ManyToMany(cascade = {CascadeType.MERGE,CascadeType.PERSIST}, fetch = FetchType.EAGER)
    private List<Photo> photos;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Const.QuestionType type;

    private String answer;

    @Column(columnDefinition = "varchar(300)")
    private String instruction;

    @Column(nullable = false)
    private Double score;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @SQLRestriction("status = 1")
    @OrderBy("number ASC")
    private List<QuestionAnswer> answers;

    @Column(nullable = false)
    private Integer number;

    @ManyToOne
    @JoinColumn(name = "test_id", nullable = false)
    @SQLRestriction("status = 1")
    private LessonContentTest test;

    @Column(columnDefinition = "varchar(300)", name = "`explain`")
    private String explain;
}
