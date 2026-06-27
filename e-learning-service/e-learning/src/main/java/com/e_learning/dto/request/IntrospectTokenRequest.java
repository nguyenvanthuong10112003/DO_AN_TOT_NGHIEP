package com.e_learning.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class IntrospectTokenRequest {
    @NotBlank
    private String token;
}
