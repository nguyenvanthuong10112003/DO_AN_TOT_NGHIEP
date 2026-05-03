package com.e_learning.repository;

import com.e_learning.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, String> {
    Optional<Course> findByIdAndStatus(String id, Integer status);
    List<Course> findAllByStatusAndIdIn(Integer status, List<String> id);
}
