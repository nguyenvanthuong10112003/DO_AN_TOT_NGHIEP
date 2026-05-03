package com.e_learning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class PhotoResponse {
    private String id;
    private String url;
    private Boolean isActive;
    private String rootId;
    private String uploadBy;
    private LocalDateTime waitExpireAt;
}
