package com.e_learning.config;

import com.e_learning.common.Const;
import com.e_learning.entity.Role;
import com.e_learning.entity.User;
import com.e_learning.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@Configuration
@RequiredArgsConstructor
public class AppConfig {
    final UserRepository userRepository;
    final PasswordEncoder passwordEncoder;
    @PostConstruct
    public void init() {
        if (userRepository.existsByUsernameAndStatus(Const.ADMIN_ACCOUNT_USERNAME, Const.STATUS_ACTIVE))
            return;

        User adminAccount = User.builder()
            .username(Const.ADMIN_ACCOUNT_USERNAME)
            .password(passwordEncoder.encode(Const.ADMIN_ACCOUNT_PASSWORD))
            .fullName(Const.ADMIN_ACCOUNT_FULL_NAME)
            .roles(Set.of(Role.ADMIN))
            .build();

        userRepository.save(adminAccount);
    }
}
