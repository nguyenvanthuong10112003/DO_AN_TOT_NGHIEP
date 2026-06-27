package com.media.client;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class IntrospectTokenResponse {
    private Boolean isValid;
    private UserResponse userResponse;
}
