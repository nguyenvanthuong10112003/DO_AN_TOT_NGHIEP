package com.e_learning.repository;

import com.e_learning.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmailAndStatus(String email, Integer status);
    boolean existsByEmailAndStatus(String email, Integer status);
    @Query("SELECT u FROM User u WHERE u.status = 1 AND (u.username = :username OR u.email = :email)")
    Optional<User> findActiveByUsernameOrEmail(@Param("username") String username, @Param("email") String email);
    Optional<User> findByUsernameOrEmail(String username, String email);
    Optional<User> findByUsernameAndStatus(String username, Integer status);
    @Query("""
        SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END
        FROM User u
        WHERE u.status = 1
          AND (u.username = :username OR u.email = :email)
    """)
    boolean existsActiveByUsernameOrEmail(@Param("username") String username,
                                          @Param("email") String email);
    Optional<User> findByIdAndStatus(String id, Integer status);
    boolean existsByIdAndStatus(String id, Integer status);
    boolean existsByUsernameAndStatus(String username, Integer status);
    @Query("""
        SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END
        FROM User u
        WHERE u.status = 1
          AND u.username = :username
          AND u.id NOT IN (:ids)
    """)
    boolean existsActiveByUsernameAndNotInIds(@Param("username") String username, @Param("ids") List<String> ids);
}
