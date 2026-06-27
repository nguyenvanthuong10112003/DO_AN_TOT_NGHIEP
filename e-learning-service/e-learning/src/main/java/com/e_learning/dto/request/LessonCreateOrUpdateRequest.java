package com.e_learning.dto.request;

import com.e_learning.dto.ChapterDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LessonCreateOrUpdateRequest {
    @NotBlank
    private String courseId;
    @NotEmpty
    @Valid
    private List<ChapterDTO> chapters;
}
