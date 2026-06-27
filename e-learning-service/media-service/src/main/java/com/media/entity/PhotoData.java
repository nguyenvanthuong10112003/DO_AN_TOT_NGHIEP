package com.media.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "photo_data")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhotoData {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] data;
    private String fileName;
    @Column(nullable = false)
    private String contentType;
    private String uploadBy;
    private LocalDateTime uploadDatetime;
    private Boolean status;
}
