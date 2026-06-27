package com.e_learning.repository;

import com.e_learning.common.Const;
import com.e_learning.entity.CourseSubscribe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseSubscribeRepository extends JpaRepository<CourseSubscribe, Long> {
    CourseSubscribe findByUserIdAndCourseIdAndStatus(String userId, String courseId, Integer status);
    boolean existsByUserIdAndCourseIdAndStatus(String userId, String courseId, Integer status);
    @Query(value = """
        SELECT COUNT(DISTINCT cs.course.id)
        FROM CourseSubscribe cs
        WHERE cs.status = :status
            AND cs.user.id = :userId
    """)
    int countByUserIdAndStatus(@Param("userId") String userId, @Param("status") Integer status);
    List<CourseSubscribe> findAllByUserIdAndStatus(String userId, Integer status);
}
