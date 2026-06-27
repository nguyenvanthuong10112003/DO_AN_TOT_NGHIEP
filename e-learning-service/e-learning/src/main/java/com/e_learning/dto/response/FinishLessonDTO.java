package com.e_learning.dto.response;

import com.e_learning.dto.QuestionHistoryDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FinishLessonDTO {
    private List<QuestionHistoryDTO> questionHistories;
}
