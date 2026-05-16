package com.e_learning.service;

import com.e_learning.dto.request.CourseCreateOrUpdateRequest;
import com.e_learning.dto.response.CourseResponse;
import com.e_learning.dto.response.PageResponse;
import com.e_learning.entity.*;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

public interface CourseService {
    void createOrUpdateCourse(CourseCreateOrUpdateRequest request);
    List<CourseResponse> search(String key);
    CourseResponse getById(String id);
    PageResponse<CourseResponse> searchLimit(String key, String sectorId, String topicId, CourseDifficult difficult, CourseLanguage language,  CourseType type, Double priceFrom, Double priceTo, Course.COLUMNS orderBy, Sort.Direction orderMode, Integer pageNumber, Integer pageSize);
    Long count();
    void remove(List<String> ids);
}
