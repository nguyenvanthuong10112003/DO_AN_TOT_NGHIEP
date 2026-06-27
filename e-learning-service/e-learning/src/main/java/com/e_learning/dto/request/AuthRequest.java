package com.e_learning.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthRequest {
    @NotBlank
    @Length(min = 3, max = 30)
    String username;
    @NotBlank
    @Length(max = 100, min = 5)
    String password;
    Boolean withRoleAdmin;
}