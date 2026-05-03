package com.e_learning.repository;

import com.e_learning.entity.CourseSector;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SectorRepository extends JpaRepository<CourseSector, String> {
    List<CourseSector> findAllByStatus(Integer status);
    boolean existsByNameAndStatus(String name, Integer status);
    Optional<CourseSector> findByStatusAndId(Integer status, String id);
}
