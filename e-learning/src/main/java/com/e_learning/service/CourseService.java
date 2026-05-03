package com.e_learning.service;

import com.e_learning.dto.request.CourseCreateOrUpdateRequest;
import com.e_learning.entity.User;

public interface CourseService {
    void createOrUpdateCourse(CourseCreateOrUpdateRequest request);
}
