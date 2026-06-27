package com.e_learning.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AnswerDTO {
    private String id;
    @NotBlank
    @Length(max = 100)
    private String content;
    private Boolean isCorrect;
    private String questionId;
    private Integer number;
}
