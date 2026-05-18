package com.media.e_learning.repository;

import com.media.e_learning.entity.Photo;
import com.media.e_learning.entity.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VideoRepository extends JpaRepository<Video, String> {
    @Query(value = "SELECT v FROM Video v WHERE v.id = :id AND (v.status = true OR (v.waitExpireAt is not null and v.waitExpireAt >= now()))")
    Optional<Video> findActiveByIdOrHasNoExpireActive(@Param("id") String id);
    @Query(value = "SELECT v FROM Video v WHERE v.id = :id AND v.status = true")
    Optional<Video> findActiveById(@Param("id") String id);
}
