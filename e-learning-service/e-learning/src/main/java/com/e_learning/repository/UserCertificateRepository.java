package com.e_learning.repository;

import com.e_learning.entity.UserCertificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserCertificateRepository extends JpaRepository<UserCertificate, String> {
    @Query("""
        SELECT COUNT(DISTINCT uc.course.id)
        FROM UserCertificate uc
        WHERE uc.user.id = :userId
            AND uc.status = :status
    """)
    int countByUserIdAndStatus(@Param("userId") String userId, @Param("status") Integer status);
}
