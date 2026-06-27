package com.e_learning.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VideoDTO {
    @NotBlank
    private String id;
    private String url;
    private Boolean isActive;
    private Integer width; // pixels
    private Integer height; // pixels
    @NotNull
    @Positive
    private Double duration; // seconds
    @NotNull
    @Positive
    private Integer quality; // resolution: 480, 720, 1080
}
