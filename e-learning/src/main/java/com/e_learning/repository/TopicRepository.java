package com.e_learning.repository;

import com.e_learning.entity.CourseTopic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TopicRepository extends JpaRepository<CourseTopic, String> {
    @Query(value = """
        SELECT t.* FROM topic t
        INNER JOIN sector s
        ON t.sector_id = s.id AND s.status = 1
        WHERE t.status = 1
            AND t.id = :topicId
            AND t.sector_id = :sectorId
    """, nativeQuery = true)
    Optional<CourseTopic> findActiveByTopicIdAndSectorId(@Param("topicId") String topicId, @Param("sectorId") String sectorId);
    @Query(value = """
        SELECT t.* FROM topic t
        INNER JOIN sector s
        ON t.sector_id = s.id AND s.status = 1
        WHERE t.status = 1
            AND t.sector_id = :sectorId
        ORDER BY s.id, t.name ASC
    """, nativeQuery = true)
    List<CourseTopic> findAllActiveBySectorId(@Param("sectorId") String sectorId);
    @Query(value = """
        SELECT t.* FROM topic t
        INNER JOIN sector s
            ON t.sector_id = s.id AND s.status = 1
        WHERE t.status = 1
        ORDER BY s.id, t.name ASC
    """, nativeQuery = true)
    List<CourseTopic> findAllActive();
    boolean existsByNameAndSectorIdAndStatus(String name, String sectorId, Integer status);
    Optional<CourseTopic> findByIdAndStatus(String id, Integer status);
}
