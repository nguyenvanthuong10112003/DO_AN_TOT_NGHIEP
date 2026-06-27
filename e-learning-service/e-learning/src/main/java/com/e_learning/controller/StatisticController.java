package com.e_learning.controller;

import com.e_learning.dto.response.ResponseApi;
import com.e_learning.dto.response.StatisticResponse;
import com.e_learning.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/statistics")
public class StatisticController {
    @Autowired
    private CourseService courseService;
    @GetMapping()
    public ResponseApi<?> statistics() {
        return ResponseApi.createSuccess(
            StatisticResponse.builder()
                .countCourses(courseService.count())
                .countMyCourse(courseService.countMyCourses())
                .countMyCertificates(courseService.countMyCertificates())
                .build());
    }
}
