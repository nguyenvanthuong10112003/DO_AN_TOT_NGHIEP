package com.e_learning.dto;

import com.e_learning.common.Const;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
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
public class QuestionDTO {
    private String id;
    private Integer number;
    @NotBlank
    private String content;
    @NotNull
    @Positive
    private Double score;
    @NotNull
    private Const.QuestionType type;
    @Length(max = 100)
    private String answer;
    @Length(max = 300)
    private String instruction;
    @Valid
    private List<AnswerDTO> answers;
    @Valid
    private List<PhotoDTO> photos;
    @Length(max = 300)
    private String explain;
}
