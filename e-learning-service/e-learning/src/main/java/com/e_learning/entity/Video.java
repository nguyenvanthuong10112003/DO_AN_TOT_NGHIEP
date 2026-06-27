package com.e_learning.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "video_client")
@SuperBuilder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Video extends BaseEntity {
    @Id
    private String id;

    private Boolean isActive;

    private String uploadBy;

    private Integer width;

    private Integer height;

    @Column(nullable = false)
    private Double duration;

    @Column(nullable = false)
    private Integer quality;
}
