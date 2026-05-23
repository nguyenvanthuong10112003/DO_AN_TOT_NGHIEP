package com.e_learning.entity;

import com.e_learning.common.Const;
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
    public enum COLUMNS {
        ID,
        CODE,
        NAME,
        DESCRIPTION,
        CREATED_TIME,
        UPDATED_TIME,
        PRICE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    @Column(nullable = false)
    private String code;
    @Column(nullable = false)
    private String name;
    @Column(columnDefinition = "varchar(300)")
    private String description;

    // Các thẻ để tìm kiếm
    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "course_tags",
        joinColumns = @JoinColumn(name = "course_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_name", referencedColumnName = "name")
    )
    private List<CourseTag> tags;

    // Ngôn ngữ
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Const.CourseLanguage language;

    // Các khóa học gợi ý trước khi học khóa học này
    @ManyToMany(fetch = FetchType.LAZY)
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
    @Enumerated(EnumType.STRING)
    private Const.CourseDifficult difficult;

    // Loại khóa học | FREE hoặc PAID
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Const.CourseType type;

    // khóa học thuộc chủ đề, lĩnh vực
    @ManyToOne
    @JoinColumn(name = "topic_id")
    private CourseTopic topic;

    // cấp chứng chỉ khi hoàn thành
    private Boolean issuingCertificate;

    // thông tin chứng chỉ
    @OneToOne(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private CourseCertificate certificate;

    // các kiến thức cần có
    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "course_lst_required_knowledge",
        joinColumns = @JoinColumn(name = "course_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_name", referencedColumnName = "name")
    )
    private List<CourseTag> lstRequiredKnowledge;
}
