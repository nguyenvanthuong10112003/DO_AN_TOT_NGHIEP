package com.e_learning.dto.listener;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class RemoveClientPhotoRequest {
    private List<String> ids;
}
