package com.media.helper;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoInfo {
    private Integer width;
    private Integer height;
    private Double duration;
    private Integer quality;
    private boolean hasSubtitle;
}