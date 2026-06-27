package com.e_learning.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;
import com.e_learning.common.Const.Role;
import lombok.experimental.SuperBuilder;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "user")
public class User extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(nullable = false)
    String username;

    @Column(nullable = false)
    String password;

    @Column(nullable = false)
    String fullName;

    LocalDate dob;

    Boolean gender;

    String email;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "avatar_id")
    Photo avatar;

    String googleClientId;

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    Set<Role> roles;

    Long verifyCountSentContinuous;
    String verifyCode;
    LocalDateTime verifyCodeCreateAt;
    LocalDateTime verifyCodeExpireAt;
    Boolean verifyCodeUsed;
}