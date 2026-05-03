package com.e_learning.service;

import com.e_learning.entity.CourseTag;

import java.util.List;
import java.util.Set;

public interface TagService {
    List<CourseTag> getOrCreateAll(Set<String> tags);
}
