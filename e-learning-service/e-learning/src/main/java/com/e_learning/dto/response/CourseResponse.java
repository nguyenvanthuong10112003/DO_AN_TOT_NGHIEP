package com.e_learning.dto.response;

import com.e_learning.dto.ChapterDTO;
import com.e_learning.dto.SubscribeDTO;
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
    private String templateCertificate;
    private List<String> lstRequiredKnowledge;
    private LocalDateTime createdTime;
    private LocalDateTime updatedTime;
    private List<ChapterDTO> chapters;
    private String professorName;
    private PromotionType promotionType;
    private Double promotion;
    private Integer countSubscribe;
    private Double evaluate;
    private Integer countEvaluate;
    private Integer countLesson;
    // phút
    private Integer totalTime;
    private SubscribeDTO subscribe;
}