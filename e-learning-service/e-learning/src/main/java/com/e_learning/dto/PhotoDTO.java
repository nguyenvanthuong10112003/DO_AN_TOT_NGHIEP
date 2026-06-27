package com.e_learning.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class PhotoDTO {
    @NotBlank
    private String id;
    @NotBlank
    private String url;
    private Boolean isActive;
    private String uploadBy;
}
