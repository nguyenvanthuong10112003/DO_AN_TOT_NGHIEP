package com.e_learning.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "photo_client")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Video {
    @Id
    private String id;
    private Boolean isActive;
    private String uploadBy;
    private Integer width;
    private Integer height;
    private Double duration;
    private String quality;
    private boolean hasSubtitle;
}
