package com.e_learning.dto.response;

import com.e_learning.entity.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.e_learning.common.Const.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CourseResponse {
    private String topicId;
    private TopicResponse topic;
    private String sectorId;
    private SectorResponse sector;
    private String id;
    private String code;
    private String name;
    private String description;
    private List<String> tags;
    private CourseLanguage language;
    private List<CourseResponse> suggestCourses;
    private String thumbnail;
    private String thumbnailId;
    private Double price;
    private CourseDifficult difficult;
    private CourseType type;
    private Boolean issuingCertificate;
    private List<String> lstRequiredKnowledge;
    private CourseCertificateResponse certificate;
    private LocalDateTime createdTime;
    private LocalDateTime updatedTime;
}