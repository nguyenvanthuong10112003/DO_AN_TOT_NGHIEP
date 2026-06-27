package com.media.repository;

import com.media.entity.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PhotoRepository extends JpaRepository<Photo, String> {
    @Query("SELECT p FROM Photo p WHERE p.id = :id AND (p.status = true OR (p.waitExpireAt is not null and p.waitExpireAt >= now()))")
    Optional<Photo> findActiveByIdOrHasNoExpireActive(@Param("id") String id);
    Optional<Photo> findByIdAndStatus(String id, Boolean status);
    @Query("SELECT p FROM Photo p WHERE p.id IN :ids AND p.status = true")
    List<Photo> findAllActiveByIds(@Param("ids") List<String> ids);
    @Query("SELECT p FROM Photo p WHERE p.id IN :ids AND (p.status = true OR (p.waitExpireAt is not null and p.waitExpireAt >= now()))")
    List<Photo> findAllActiveOrHasNoExpireActiveByIds(@Param("ids") List<String> ids);
    @Query("SELECT p FROM Photo p WHERE p.id IN :ids AND p.waitExpireAt is not null and p.waitExpireAt >= now()")
    List<Photo> findAllHasNoExpireActiveByIds(@Param("ids") List<String> ids);
}
