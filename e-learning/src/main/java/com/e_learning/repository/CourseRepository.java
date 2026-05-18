package com.e_learning.repository;

import com.e_learning.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, String> {
    Optional<Course> findByIdAndStatus(String id, Integer status);
    List<Course> findAllByStatusAndIdIn(Integer status, List<String> id);
    @Query(value =
            " SELECT c.* FROM course c " +
            " WHERE c.status = 1 " +
            "   AND (" +
            "       c.code = :code " +
            "       OR (" +
            "           c.name = :name " +
            "           AND c.topic_id = :topicId " +
            "       )" +
            "   ) ", nativeQuery = true)
    Course getActiveByCodeOrNameAndTopicId(@Param("code") String code, @Param("name") String name, @Param("topicId") String topicId);
    @Query(value =
            " SELECT c.* FROM course c " +
            " WHERE c.status = 1 " +
            "   AND (:keyword IS NULL " +
            "       OR CONCAT(c.code, ' - ', c.name) LIKE CONCAT('%', :keyword, '%') " +
            "   ) " +
            " ORDER BY c.name ASC ", nativeQuery = true)
    List<Course> searchAllActive(@Param("keyword") String keyword);
    @Query(value = """
        SELECT c.* FROM course c
        INNER JOIN topic t
            ON t.id = c.topic_id AND t.status = 1
        INNER JOIN sector s
            ON s.id = t.sector_id AND s.status = 1
        WHERE c.status = 1
          AND (:key IS NULL OR LOWER(CONCAT(c.code, ' - ', c.name)) LIKE LOWER(CONCAT('%', TRIM(:key), '%')))
          AND (:sectorId IS NULL OR s.id = TRIM(:sectorId))
          AND (:topicId IS NULL OR t.id = TRIM(:topicId))
          AND (:difficult IS NULL OR c.difficult = :difficult)
          AND (:language IS NULL OR c.language = :language)
          AND (:type IS NULL OR (
                c.type = :type
                AND (
                    c.type = 'FREE'
                    OR (:priceFrom IS NULL AND :priceTo IS NULL)
                    OR (:priceFrom IS NULL AND IFNULL(c.price, 0) < :priceTo)
                    OR (:priceTo IS NULL AND IFNULL(c.price, 0) > :priceFrom)
                    OR (IFNULL(c.price, 0) >= :priceFrom AND IFNULL(c.price, 0) <= :priceTo)
                )
            )
          )
    """, countQuery = """
        SELECT COUNT(c.id) FROM course c
        INNER JOIN topic t
            ON t.id = c.topic_id AND t.status = 1
        INNER JOIN sector s
            ON s.id = t.sector_id AND s.status = 1
        WHERE c.status = 1
          AND (:key IS NULL OR LOWER(CONCAT(c.code, ' - ', c.name)) LIKE LOWER(CONCAT('%', TRIM(:key), '%')))
          AND (:sectorId IS NULL OR s.id = TRIM(:sectorId))
          AND (:topicId IS NULL OR t.id = TRIM(:topicId))
          AND (:difficult IS NULL OR c.difficult = :difficult)
          AND (:language IS NULL OR c.language = :language)
          AND (:type IS NULL OR (
                c.type = :type
                AND (
                    c.type = 'FREE'
                    OR (:priceFrom IS NULL AND :priceTo IS NULL)
                    OR (:priceFrom IS NULL AND IFNULL(c.price, 0) < :priceTo)
                    OR (:priceTo IS NULL AND IFNULL(c.price, 0) > :priceFrom)
                    OR (IFNULL(c.price, 0) >= :priceFrom AND IFNULL(c.price, 0) <= :priceTo)
                )
            )
          )
    """, nativeQuery = true)
    Page<Course> searchLimitActive(@Param("key") String key,
                                   @Param("sectorId") String sectorId,
                                   @Param("topicId") String topicId,
                                   @Param("difficult") String difficult,
                                   @Param("language") String language,
                                   @Param("type") String type,
                                   @Param("priceFrom") Double priceFrom,
                                   @Param("priceTo") Double priceTo,
                                   Pageable pageable);
    @Query(value = """
        SELECT COUNT(c.id) FROM course c
        WHERE c.status = 1
    """, nativeQuery = true)
    long countActive();
}

