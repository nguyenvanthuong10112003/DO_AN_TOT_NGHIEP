package com.e_learning.controller;

import com.e_learning.dto.response.FinishLessonDTO;
import com.e_learning.dto.response.ResponseApi;
import com.e_learning.service.LessonService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/lessons")
public class LessonController {
    @Autowired
    private LessonService lessonService;

    @GetMapping("/{lessonId}")
    private ResponseApi<?> getById(@PathVariable @NotBlank String lessonId) {
        return ResponseApi.createSuccess(lessonService.getClientById(lessonId));
    }

    @PostMapping("/{lessonId}/start")
    private ResponseApi<?> startLearnLesson(@PathVariable @NotBlank String lessonId) {
        return ResponseApi.createSuccess(lessonService.startLearnLesson(lessonId));
    }

    @PostMapping("/finish/{historyId}")
    private ResponseApi<?> finishLearnLesson(@PathVariable @NotBlank Long historyId, @RequestBody @Valid FinishLessonDTO dto) {
        return ResponseApi.createSuccess(lessonService.finishLearnLesson(historyId, dto));
    }

    @PostMapping("/{lessonId}/test/start")
    private ResponseApi<?> startTest(@PathVariable @NotBlank String lessonId) {

    }
}
