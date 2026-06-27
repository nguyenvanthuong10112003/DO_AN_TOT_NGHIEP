package com.media.client;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class IntrospectVideoRequest {
    private String videoId;
}
