package com.media.e_learning.helper;

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
    private String quality;
    private boolean hasSubtitle;
}