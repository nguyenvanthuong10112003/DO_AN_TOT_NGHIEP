package com.e_learning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PageResponse<T> {
    private List<T> list;
    private Integer pageNumber;
    private Integer pageSize;
    private Long totalRecord;
    private Integer totalPage;
}
