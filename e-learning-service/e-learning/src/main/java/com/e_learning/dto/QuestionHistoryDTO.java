package com.e_learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class QuestionHistoryDTO {
    private Long id;
    private String answer;
    private String strLstAnswerId;
    private String questionId;
}
