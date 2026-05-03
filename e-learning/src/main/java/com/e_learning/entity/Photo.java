package com.e_learning.entity;

import jakarta.persistence.*;
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
public class Photo extends BaseEntity {
    @Id
    String id;
    String url;
    Boolean isActive;
    String uploadBy;
}
