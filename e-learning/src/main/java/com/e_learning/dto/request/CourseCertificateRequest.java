package com.e_learning.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class CourseCertificateRequest {
    private String id;
    @NotBlank
    private String template;
    @NotBlank
    @Length(max = 100)
    private String professorName;
}