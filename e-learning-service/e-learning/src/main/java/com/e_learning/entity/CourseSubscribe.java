package com.e_learning.entity;


import com.e_learning.common.Const;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Entity
@Table(name = "subscribe")
public class CourseSubscribe extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @SQLRestriction("status = 1")
    private User user;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    @SQLRestriction("status = 1")
    private Course course;
}
