package com.media.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "video")
@Builder
public class Video {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String fileName;
    private String uploadBy;
    private LocalDateTime uploadDatetime;
    private Boolean status;
    private Integer width;
    private Integer height;
    private Double duration;
    private Integer quality;
    private String qualities;
    private boolean hasSubtitle;
    @Enumerated(EnumType.STRING)
    private EncodeStatus encodeStatus;
    private LocalDateTime waitExpireAt;
    private LocalDateTime activeDatetime;
    @Transient
    private Boolean isActive;

    public enum EncodeStatus {
        CREATE, // khởi tạo
        ENCODING, // đang encode
        ENCODE_FAIL, // encode fail
        ENCODED // đã encode
    }
}
