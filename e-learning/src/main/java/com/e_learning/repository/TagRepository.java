package com.e_learning.repository;

import com.e_learning.entity.CourseTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TagRepository extends JpaRepository<CourseTag, String> {
    List<CourseTag> findByStatusAndNameIn(Integer status, List<String> ids);
}
