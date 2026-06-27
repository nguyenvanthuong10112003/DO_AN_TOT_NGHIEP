package com.e_learning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
@SuperBuilder
public class Order extends BaseEntity {
    // status  - 0: inactive / canceled
    //         - 1: active
    //         - 2: payed


    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @SQLRestriction("status = 1")
    private User user;

    @OneToMany(fetch = FetchType.EAGER)
    private List<CourseSubscribe> subscribes;

    private Double total;
}
