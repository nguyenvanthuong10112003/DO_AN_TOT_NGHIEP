package com.e_learning.service;

import com.e_learning.dto.ProgressDTO;
import com.e_learning.dto.LessonDTO;
import com.e_learning.dto.response.FinishLessonDTO;

public interface LessonService {
    LessonDTO getClientById(String lessonId);
    ProgressDTO startLearnLesson(String lessonId);
    ProgressDTO finishLearnLesson(Long historyId, FinishLessonDTO dto);
}
