package com.e_learning.config;

import com.e_learning.common.Const.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {
    final String[] PUBLIC_ACTIONS = {
        "/auth/login-with-google-account",
        "/auth/login",
        "/auth/register",
        "/auth/refresh",
        "/auth/introspect",
        "/auth/create-verify-code",
        "/auth/create-new-password",
        "/tests/*"};
    final String[] ADMIN_ACTIONS = {
        "/admin/**"
    };

    final JwtCustom jwtCustom;
    final JwtAuthEntryPoint jwtAuthEntryPoint;
    final JwtAccessDeniedHandler jwtAccessDeniedHandler;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.authorizeHttpRequests(request ->
            request
                .requestMatchers(PUBLIC_ACTIONS)
                .permitAll()
                .requestMatchers(ADMIN_ACTIONS)
                .hasRole(Role.ADMIN.getName())
                .anyRequest()
                .authenticated());

        httpSecurity.oauth2ResourceServer(oauth2 ->
            oauth2
                .jwt(jwtConfigurer -> jwtConfigurer
                        .jwtAuthenticationConverter(jwtAuthenticationConverter())
                        .decoder(jwtCustom))
                .authenticationEntryPoint(jwtAuthEntryPoint)
                .accessDeniedHandler(jwtAccessDeniedHandler));

        httpSecurity.csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults());

        return httpSecurity.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter =
                new JwtGrantedAuthoritiesConverter();

        grantedAuthoritiesConverter.setAuthoritiesClaimName("roles");
        grantedAuthoritiesConverter.setAuthorityPrefix("");

        JwtAuthenticationConverter jwtAuthenticationConverter =
                new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);

        return jwtAuthenticationConverter;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }
}
