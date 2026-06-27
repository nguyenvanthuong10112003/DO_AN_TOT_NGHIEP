package com.media.client;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class IntrospectTokenRequest {
    private String token;
}
