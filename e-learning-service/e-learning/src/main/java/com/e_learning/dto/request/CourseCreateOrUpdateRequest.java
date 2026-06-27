package com.e_learning.dto.request;

import com.e_learning.common.Const.CourseType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;
import com.e_learning.common.Const.*;
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
    @Positive
    private Double price;
    @Size(max = 10)
    private List<String> lstRequiredKnowledge;
    @Size(max = 10)
    @NotEmpty
    private List<String> tags;
    @Size(max = 10)
    private List<String> suggestCourses;
    private Boolean issuingCertificate;
    @Length(max = 100)
    private String newSectorName;
    @Length(max = 100)
    private String newTopicName;
    @NotBlank
    @Length(max = 100)
    private String professorName;
    private String templateCertificate;
    @Positive
    private Double promotion;
    private PromotionType promotionType;
}
