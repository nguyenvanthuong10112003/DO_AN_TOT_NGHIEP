package com.e_learning.controller;

import com.e_learning.common.Const;
import com.e_learning.dto.SubscribeDTO;
import com.e_learning.dto.response.ResponseApi;
import com.e_learning.entity.Course;
import com.e_learning.service.CourseService;
import com.e_learning.service.SectorService;
import com.e_learning.service.TagService;
import com.e_learning.service.TopicService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
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
    @Autowired
    private TagService tagService;

    @GetMapping("/get-all-sector")
    public ResponseApi<?> getAllSector() {
        return ResponseApi.createSuccess(sectorService.getAllSector());
    }

    @GetMapping("/get-all-topic")
    public ResponseApi<?> getAllTopic(@RequestParam(required = false) String sectorId) {
        return ResponseApi.createSuccess(topicService.findAll(sectorId));
    }

    @GetMapping("/search-tags")
    public ResponseApi<?> searchTags(@RequestParam(required = false) String key) {
        return ResponseApi.createSuccess(tagService.search(key));
    }

    @GetMapping("/search-courses")
    public ResponseApi<?> searchCourse(@RequestParam(required = false) String key) {
        return ResponseApi.createSuccess(courseService.search(key));
    }

    @GetMapping("/search-courses-limit")
    public ResponseApi<?> searchCourseLimit(
            @RequestParam(required = false) String key,
            @RequestParam(required = false) String sectorId,
            @RequestParam(required = false) String topicId,
            @RequestParam(required = false) Const.CourseDifficult difficult,
            @RequestParam(required = false) Const.CourseLanguage language,
            @RequestParam(required = false) Const.CourseType type,
            @RequestParam(required = false) Double priceFrom,
            @RequestParam(required = false) Double priceTo,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "1") Integer pageNumber,
            @RequestParam(required = false) Course.COLUMNS orderBy,
            @RequestParam(required = false)Sort.Direction orderMode) {
        return ResponseApi.createSuccess(courseService.searchLimit(key, sectorId, topicId, difficult, language, type, priceFrom, priceTo, orderBy, orderMode, pageNumber, pageSize));
    }

    @GetMapping("/{id}")
    public ResponseApi<?> getById(@PathVariable String id) {
        return ResponseApi.createSuccess(courseService.getById(id));
    }

    @GetMapping("/count")
    public ResponseApi<?> count() {
        return ResponseApi.createSuccess(courseService.count());
    }

    @PostMapping("/subscribe")
    public ResponseApi<?> subscribe(@RequestBody @Valid SubscribeDTO request) {
        return ResponseApi.createSuccess(courseService.subscribeCourse(request, null));
    }

    @GetMapping("/{courseId}/detail")
    public ResponseApi<?> getDetailByCourseId(@PathVariable @NotBlank String courseId) {
        try {
            return ResponseApi.createSuccess(courseService.getDetailById(courseId));
        } catch (Exception e) {
            throw generateError(e);
        }
    }
}
