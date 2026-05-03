package com.e_learning.dto.request;

import com.e_learning.validator.image.ImageConstraint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserUpdateRequest {
    @NotBlank
    @Length(min = 1, max = 100)
    private String fullName;
    @NotBlank
    @Length(min = 3, max = 30)
    private String username;
    @NotNull
    private Boolean gender;
    @NotNull
    private LocalDate dob;
    @ImageConstraint
    private MultipartFile avatarFile;
}
