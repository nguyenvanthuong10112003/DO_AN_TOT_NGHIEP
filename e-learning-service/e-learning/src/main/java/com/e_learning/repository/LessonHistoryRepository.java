package com.e_learning.repository;

import com.e_learning.entity.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonHistoryRepository extends JpaRepository<LessonProgress, Long> {
    @Query(nativeQuery = true, value = """
        SELECT h.* 
        FROM progress h
        INNER JOIN lesson l 
            ON l.id = h.lesson_id AND l.status = 1 AND l.chapter_id = :chapterId
        WHERE h.status = 1
            AND h.user_id = :userId
            AND h.is_done = 1
    """)
    List<LessonProgress> findAllFinishedByCourseIdAndUserId(@Param("chapterId") String chapterId, @Param("userId") String userId);
    Optional<LessonProgress> findByIdAndUserIdAndStatus(Long id, String userId, Integer status);
}
