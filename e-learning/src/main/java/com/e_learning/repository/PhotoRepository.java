package com.e_learning.repository;

import com.e_learning.entity.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhotoRepository extends JpaRepository<Photo, String> {
    List<Photo> findAllByStatusAndIsActiveAndIdIn(Integer status, Boolean isActive, List<String> ids);
    List<Photo> findAllByStatusAndIdIn(Integer status, List<String> ids);
}
