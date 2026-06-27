package com.e_learning.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ContentArticleDTO {
    private String id;
    @NotBlank
    private String content;
    @Valid
    private List<PhotoDTO> photos;
}
