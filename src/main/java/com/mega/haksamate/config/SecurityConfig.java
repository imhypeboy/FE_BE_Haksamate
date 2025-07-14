package com.mega.haksamate.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.Customizer;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())  // CSRF 비활성화
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/**", "/uploads/**", "/ws/**").permitAll()  // ✅ 필요한 경로만 허용
                        .anyRequest().permitAll()  // 그 외는 기본 허용 (개발 단계니까)
                )
                .cors(Customizer.withDefaults());  // CORS 허용

        return http.build();
    }
}
