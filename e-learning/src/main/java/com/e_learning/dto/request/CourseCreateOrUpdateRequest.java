package com.e_learning.dto.request;

import com.e_learning.entity.CourseDifficult;
import com.e_learning.entity.CourseLanguage;
import com.e_learning.entity.CourseType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CourseCreateOrUpdateRequest {
    private String id;
    @NotBlank
    @Length(max = 30)
    private String code;
    @NotBlank
    @Length(max = 100)
    private String name;
    private String sectorId;
    private String topicId;
    @NotBlank
    @Length(max = 300)
    private String description;
    private String thumbnailId;
    @NotNull
    private CourseDifficult difficult;
    @NotNull
    private CourseLanguage language;
    @NotNull
    private CourseType type;
    @Min(0)
    private Double price;
    @Size(max = 10)
    private List<String> lstRequiredKnowledge;
    @Size(max = 10)
    private List<String> tags;
    @Size(max = 10)
    private List<String> suggestCourses;
    private Boolean issuingCertificate;
    private CourseCertificateRequest certificate;
    @Length(max = 100)
    private String newSectorName;
    @Length(max = 100)
    private String newTopicName;
}
