package com.e_learning.dto;

import com.e_learning.common.Const;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LessonDTO {
    private String id;
    @NotNull
    private Const.LessonType type;
    @NotBlank
    @Length(max = 100)
    private String name;
    private String chapterId;
    private Integer number;
    @NotBlank
    @Length(max = 300)
    private String description;
    @Positive
    private Integer duration; // minutes
    private Boolean requireFinish;
    private Boolean canPreview;
    @Positive
    private Double passScore;
    private Boolean showAnswer;
    private Boolean isMix;
    @Valid
    private ContentArticleDTO article;
    @Valid
    private ContentTestDTO test;
    @Valid
    private ContentVideoDTO video;
    private Double totalScore;
    private Const.ScoringMode scoringMode;
}
