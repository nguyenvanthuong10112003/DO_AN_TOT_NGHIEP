package com.e_learning.controller;

import com.e_learning.dto.request.CourseCreateOrUpdateRequest;
import com.e_learning.dto.response.ResponseApi;
import com.e_learning.service.CourseService;
import com.e_learning.service.SectorService;
import com.e_learning.service.TopicService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/courses")
public class CourseController extends BaseController {
    @Autowired
    private CourseService courseService;
    @Autowired
    private SectorService sectorService;
    @Autowired
    private TopicService topicService;

    @GetMapping("/get-all-sector")
    public ResponseApi<?> getAllSector() {
        return ResponseApi.createSuccess(sectorService.getAllSector());
    }

    @GetMapping("/get-all-topic")
    public ResponseApi<?> getAllTopic(@RequestParam @NotBlank String sectorId) {
        return ResponseApi.createSuccess(topicService.findAllBySector(sectorId));
    }
}
