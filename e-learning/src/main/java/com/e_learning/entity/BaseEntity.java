package com.e_learning.entity;

import com.e_learning.helper.DataUtil;
import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@MappedSuperclass
public class BaseEntity {
    // thoi gian tao
    @Column(updatable = false)
    private LocalDateTime createdTime;
    // thoi gian cap nhat gan nhat
    private LocalDateTime updatedTime;
    // trang thai: 1 - con hoat dong, 0 - khong hoat dong
    @Column(columnDefinition = "TINYINT(1)")
    private Integer status;

    @PrePersist
    void onCreate() {
        if (createdTime == null)
            createdTime = DataUtil.now();
        if (status == null)
            status = 1;
        if (updatedTime == null)
            updatedTime = DataUtil.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedTime = DataUtil.now();
    }
}
