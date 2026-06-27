package com.e_learning.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChapterDTO {
    private String id;
    @NotBlank
    @Length(max = 100)
    private String name;
    private String courseId;
    @NotEmpty
    @Valid
    private List<LessonDTO> lessons;
    private Integer number;
    private Integer totalTime;
    private Integer totalLesson;
}
