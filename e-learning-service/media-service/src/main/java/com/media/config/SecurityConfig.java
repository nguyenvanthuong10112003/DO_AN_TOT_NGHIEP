package com.media.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@RequiredArgsConstructor
@Configuration
public class SecurityConfig {
    final String[] PUBLIC_ACTIONS = {"/photos/{id}", "/videos/play", "/videos/{id}/thumbnail"};
    final String[] ADMIN_ACTION = {"/videos/upload"};
    final JwtFilter jwtFilter;
    final JwtAuthEntryPoint jwtAuthEntryPoint;
    final JwtAccessDeniedHandler jwtAccessDeniedHandler;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
            .authorizeHttpRequests(request -> request
                .requestMatchers(PUBLIC_ACTIONS)
                    .permitAll()
                .requestMatchers(ADMIN_ACTION)
                    .hasRole("ADMIN")
                .anyRequest()
                    .authenticated());

        httpSecurity
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(jwtAuthEntryPoint)
                .accessDeniedHandler(jwtAccessDeniedHandler) )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        httpSecurity
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults());

        httpSecurity.headers(headers -> headers
            .frameOptions(HeadersConfigurer.FrameOptionsConfig::disable)
        );
        return httpSecurity.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000"));
        config.setAllowedMethods(List.of("*"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
