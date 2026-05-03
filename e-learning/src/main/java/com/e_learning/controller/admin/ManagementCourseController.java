package com.e_learning.controller.admin;

import com.e_learning.controller.BaseController;
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
@RequestMapping("/admin/courses")
public class ManagementCourseController extends BaseController {
    @Autowired
    private CourseService courseService;

    @PostMapping("/create")
    public ResponseApi<?> createCourse(@RequestBody @Valid CourseCreateOrUpdateRequest request) {
        try {
            courseService.createOrUpdateCourse(request);
            return ResponseApi.createSuccess();
        } catch (Exception e) {
            throw generateError(e);
        }
    }

    @PostMapping("/update")
    public ResponseApi<?> updateCourse(@RequestBody @Valid CourseCreateOrUpdateRequest request) {
        try {
            courseService.createOrUpdateCourse(request);
            return ResponseApi.createSuccess();
        } catch (Exception e) {
            throw generateError(e);
        }
    }
}