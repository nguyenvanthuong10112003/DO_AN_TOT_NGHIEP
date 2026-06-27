package com.e_learning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class StatisticResponse {
    private Long countCourses;
    private Long countMyCourse;
    private Long countMyCertificates;
}
