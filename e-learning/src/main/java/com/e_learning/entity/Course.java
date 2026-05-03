package com.e_learning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Entity
@Table(name = "course")
@AllArgsConstructor
@NoArgsConstructor
public class Course extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    @Column(nullable = false)
    private String name;
    private String description;
    private String createdBy;

    // Các thẻ để tìm kiếm
    @ManyToMany
    @JoinTable(
        name = "course_tags",
        joinColumns = @JoinColumn(name = "course_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_name", referencedColumnName = "name")
    )
    private List<CourseTag> tags;

    // Ngôn ngữ
    @Column(nullable = false)
    private CourseLanguage language;

    // Các khóa học gợi ý trước khi học khóa học này
    @ManyToMany
    @JoinTable(
        name = "course_suggestions",
        joinColumns = @JoinColumn(name = "course_id"),
        inverseJoinColumns = @JoinColumn(name = "suggest_course_id", referencedColumnName = "id")
    )
    private List<Course> suggestCourses;

    // Ảnh nền khóa học
    @OneToOne
    @JoinColumn(name = "photo_id")
    private Photo thumbnail;

    // giá nếu là khoa học paid
    private Double price;

    // Độ khó
    @Column(nullable = false)
    private CourseDifficult difficult;

    // Loại khóa học | FREE hoặc PAID
    @Column(nullable = false)
    private CourseType type;

    // khóa học thuộc chủ đề, lĩnh vực
    @ManyToOne
    @JoinColumn(name = "topic_id")
    private CourseTopic topic;

    // cấp chứng chỉ khi hoàn thành
    private Boolean issuingCertificate;

    // thông tin chứng chỉ
    @OneToOne(mappedBy = "course", cascade = CascadeType.ALL)
    private CourseCertificate certificate;

    // các kiến thức cần có
    @ManyToMany
    @JoinTable(
        name = "course_lst_required_knowledge",
        joinColumns = @JoinColumn(name = "course_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_name", referencedColumnName = "name")
    )
    private List<CourseTag> lstRequiredKnowledge;
}
