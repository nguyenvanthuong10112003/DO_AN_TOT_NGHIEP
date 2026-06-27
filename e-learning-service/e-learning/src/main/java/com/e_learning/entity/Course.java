package com.e_learning.entity;

import com.e_learning.common.Const;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

import java.util.List;

@Data
@Entity
@Table(name = "course")
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class Course extends BaseEntity {
    public enum COLUMNS {
        ID,
        CODE,
        NAME,
        DESCRIPTION,
        CREATED_TIME,
        UPDATED_TIME,
        PRICE,
        PROFESSOR_NAME
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @EqualsAndHashCode.Include
    private String id;

    @Column(nullable = false)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "varchar(300)")
    private String description;

    // Các thẻ để tìm kiếm
    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.LAZY)
    @JoinTable(
        name = "course_tags",
        joinColumns = @JoinColumn(name = "course_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_name", referencedColumnName = "name")
    )
    @OrderBy("name")
    @SQLRestriction("status = 1")
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
    @OrderBy("name")
    @SQLRestriction("status = 1")
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
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    @SQLRestriction("status = 1")
    private CourseTopic topic;

    // cấp chứng chỉ khi hoàn thành
    private Boolean issuingCertificate;

    // template chứng chỉ
    private String templateCertificate;

    @Column(nullable = false)
    private String professorName;

    // các kiến thức cần có
    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.LAZY)
    @JoinTable(
        name = "course_lst_required_knowledge",
        joinColumns = @JoinColumn(name = "course_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_name", referencedColumnName = "name")
    )
    @OrderBy("name")
    @SQLRestriction("status = 1")
    private List<CourseTag> lstRequiredKnowledge;

    // các chương khóa học
    @OneToMany(mappedBy = "course", fetch = FetchType.LAZY)
    @OrderBy("number")
    @SQLRestriction("status = 1")
    private List<LessonChapter> chapters;

    // Loại khuyến mãi: số tiền | phần trăm
    @Enumerated(EnumType.STRING)
    private Const.PromotionType promotionType;

    // Khuyến mãi
    private Double promotion;

    // Đánh giá
    @OneToMany(mappedBy = "course", fetch = FetchType.LAZY)
    @OrderBy("starNo DESC, updatedTime DESC")
    @SQLRestriction("status = 1")
    private List<Evaluate> evaluates;

    // Lượt đăng ký
    @OneToMany(mappedBy = "course", fetch = FetchType.LAZY)
    @OrderBy("updatedTime DESC")
    @SQLRestriction("status = 1")
    private List<CourseSubscribe> subscribes;
}
