package com.e_learning.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SendEmailDTO {
    @NotBlank
    String receiver;
    @NotBlank
    String title;
    @NotBlank
    String template;
    Map<String, String> mapping;
    String body;
}