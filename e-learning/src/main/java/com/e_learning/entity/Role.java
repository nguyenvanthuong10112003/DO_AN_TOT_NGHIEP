package com.e_learning.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Getter
public enum Role {
    ADMIN("ADMIN", "Role admin"),
    USER("USER", "Role user")
    ;
    private String name;
    private String description;
}
