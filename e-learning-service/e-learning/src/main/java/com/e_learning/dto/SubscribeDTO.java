package com.e_learning.dto;

import com.e_learning.dto.response.CourseResponse;
import com.e_learning.dto.response.UserResponse;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SubscribeDTO {
    private Long id;
    @NotBlank
    private String courseId;
    private CourseResponse course;
    private String userId;
    private UserResponse user;
    private LocalDateTime updatedTime;
    private Integer status;
}
