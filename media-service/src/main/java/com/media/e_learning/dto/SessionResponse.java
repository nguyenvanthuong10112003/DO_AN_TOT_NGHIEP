package com.media.e_learning.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SessionResponse {
    private String id;
    private String videoId;
    private LocalDateTime expireAt;
    private LocalDateTime createAt;
    private String createBy;
}

