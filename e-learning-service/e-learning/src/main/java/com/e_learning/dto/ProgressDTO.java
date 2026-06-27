package com.e_learning.dto;

import com.e_learning.dto.response.UserResponse;
import com.e_learning.entity.LessonProgress;
import com.e_learning.entity.LessonQuestionHistory;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ProgressDTO {
    private Long id;
    private UserResponse user;
    @NotBlank
    private String lessonId;
    private LessonDTO lesson;
    private LocalDateTime startTime;
    private LocalDateTime finishTime;
    private Boolean isDone;
}
