package com.e_learning.repository;

import com.e_learning.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, String> {
    Optional<Lesson> findByIdAndStatus(String id, Integer status);
}
