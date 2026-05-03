package com.e_learning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserResponse {
    private String id;
    private String username;
    private String fullName;
    private String email;
    private String avatar;
    private Boolean gender;
    private Set<String> roles;
    private String emailLinked;
    private LocalDate dob;
}
