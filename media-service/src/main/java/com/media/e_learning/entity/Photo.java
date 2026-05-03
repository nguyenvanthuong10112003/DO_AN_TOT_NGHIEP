package com.media.e_learning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "photo")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Photo {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "data_id", nullable = false)
    private PhotoData data;
    private String uploadBy;
    private LocalDateTime uploadDatetime;
    private LocalDateTime waitExpireAt;
    private LocalDateTime activeDatetime;
    private Boolean status;
    @Transient
    private String rootId;
    @Transient
    private Boolean isActive;
}
