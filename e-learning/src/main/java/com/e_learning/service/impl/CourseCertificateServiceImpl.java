package com.e_learning.service.impl;

import com.e_learning.common.Const;
import com.e_learning.dto.request.CourseCertificateRequest;
import com.e_learning.entity.CourseCertificate;
import com.e_learning.helper.ValidatorUtil;
import com.e_learning.mapper.CourseCertificateMapper;
import com.e_learning.repository.CourseCertificateRepository;
import com.e_learning.service.CourseCertificateService;
import org.apache.logging.log4j.util.Strings;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CourseCertificateServiceImpl implements CourseCertificateService {
    @Autowired
    private CourseCertificateRepository courseCertificateRepository;
    @Autowired
    private CourseCertificateMapper courseCertificateMapper;
    @Override
    public CourseCertificate createOrUpdate(CourseCertificate old, CourseCertificateRequest request) {
        if (request == null)
            throw new RuntimeException("certificate content is required");

        ValidatorUtil.validate(request);
        CourseCertificate certificate = old == null ? new CourseCertificate() : old;
        courseCertificateMapper.update(certificate, request);
        return certificate;
    }
}
