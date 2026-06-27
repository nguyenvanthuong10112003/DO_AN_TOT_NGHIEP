package com.e_learning.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "photo_client")
@SuperBuilder
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class Photo extends BaseEntity {
    @EqualsAndHashCode.Include
    @Id
    private String id;

    @Column(nullable = false)
    private String url;

    private Boolean isActive;

    private String uploadBy;
}
