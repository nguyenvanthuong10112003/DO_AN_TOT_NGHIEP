package com.e_learning.service;

import com.e_learning.dto.request.CourseCertificateRequest;
import com.e_learning.entity.Course;
import com.e_learning.entity.CourseCertificate;

public interface CourseCertificateService {
    CourseCertificate createOrUpdate(CourseCertificate old, CourseCertificateRequest request);
}
