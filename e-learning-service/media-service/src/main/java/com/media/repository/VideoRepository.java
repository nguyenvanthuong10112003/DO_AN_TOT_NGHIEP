package com.media.repository;

import com.media.entity.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VideoRepository extends JpaRepository<Video, String> {
    @Query(value = "SELECT v FROM Video v WHERE v.id = :id AND (v.status = true OR (v.waitExpireAt is not null and v.waitExpireAt >= now()))")
    Optional<Video> findActiveByIdOrHasNoExpireActive(@Param("id") String id);
    @Query(value = "SELECT v FROM Video v WHERE v.id = :id AND v.status = true")
    Optional<Video> findActiveById(@Param("id") String id);
    @Query("SELECT v FROM Video v WHERE v.id IN :ids AND v.waitExpireAt is not null and v.waitExpireAt >= now()")
    List<Video> findAllHasNoExpireActiveByIds(@Param("ids") List<String> ids);
    @Query("SELECT p FROM Video p WHERE p.id IN :ids AND (p.status = true OR (p.waitExpireAt is not null and p.waitExpireAt >= now()))")
    List<Video> findAllActiveOrHasNoExpireActiveByIds(@Param("ids") List<String> ids);
}
