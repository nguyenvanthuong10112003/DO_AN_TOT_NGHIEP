package com.e_learning.repository;

import com.e_learning.entity.CourseCertificate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CourseCertificateRepository extends JpaRepository<CourseCertificate, String> {
    Optional<CourseCertificate> findByIdAndStatus(String id, Integer status);
}
