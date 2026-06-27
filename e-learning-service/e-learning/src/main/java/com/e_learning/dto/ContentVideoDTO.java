package com.e_learning.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ContentVideoDTO {
    private String id;
    @NotNull
    @Valid
    private VideoDTO videoInfo;
    @NotNull
    @Positive
    private Integer qualityDefault;
    @NotBlank
    @Length(max = 300)
    private String summary;
}
