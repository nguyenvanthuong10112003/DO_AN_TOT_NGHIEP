package com.e_learning.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ChangePasswordRequest {
    @NotBlank
    @Length(max = 100, min = 5)
    private String oldPassword;
    @NotBlank
    @Length(max = 100, min = 5)
    private String newPassword;
}
