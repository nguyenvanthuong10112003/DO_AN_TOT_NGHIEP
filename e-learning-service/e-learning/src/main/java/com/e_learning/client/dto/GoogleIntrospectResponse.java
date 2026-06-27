package com.e_learning.client.dto;


import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class GoogleIntrospectResponse {
    private String accessToken;
    private Long expiresIn;
    private String scope;
    private String tokenType;
    private String idToken;
    private String refreshTokenExpiresIn;
    private LocalDateTime tokenExpireAt;
}
