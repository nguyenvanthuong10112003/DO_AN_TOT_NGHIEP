package com.e_learning.repository;

import com.e_learning.entity.CourseTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TagRepository extends JpaRepository<CourseTag, String> {
    List<CourseTag> findAllByStatusAndNameIn(Integer status, List<String> ids);
    @Query(value =
            " SELECT t.* " +
            " FROM tag t " +
            " WHERE t.status = 1 " +
            "   AND (:keyword IS NULL" +
            "       OR LOWER(t.name) LIKE CONCAT('%', LOWER(:keyword) ,'%') " +
            "   ) " +
            " ORDER BY t.name ASC ", nativeQuery = true)
    List<CourseTag> searchAllActive(@Param("keyword") String keyword);
}
