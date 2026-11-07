
package com.hospital_management.security;

import java.util.List;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth

                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/patients/register",
                    "/api/patients/login",
                    "/api/doctors/register",
                    "/api/doctors/login",
                    "/api/admins/login"
                ).permitAll()

                .requestMatchers("/api/admins/register")
                    .hasRole("ADMIN")

                .requestMatchers("/api/admin/statistics")
                    .hasRole("ADMIN")

                .requestMatchers(HttpMethod.GET, "/api/doctors")
                    .hasAnyRole("PATIENT", "DOCTOR", "ADMIN")

                .requestMatchers("/api/patients/**")
                    .hasAnyRole("PATIENT", "ADMIN")

                .requestMatchers("/api/doctors/**")
                    .hasAnyRole("DOCTOR", "ADMIN")

                .requestMatchers("/api/appointments/**")
                    .hasAnyRole("PATIENT", "DOCTOR", "ADMIN")

                // Patient can only request their records endpoint.
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/medical-records/patient/**"
                ).hasAnyRole("PATIENT", "DOCTOR", "ADMIN")

                // Only Doctor and Admin can view all records.
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/medical-records"
                ).hasAnyRole("DOCTOR", "ADMIN")

                // Only Doctor and Admin can add records.
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/medical-records/**"
                ).hasAnyRole("DOCTOR", "ADMIN")

                // Only Doctor and Admin can delete records.
                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/medical-records/**"
                ).hasAnyRole("DOCTOR", "ADMIN")

                .requestMatchers("/api/bills/**")
                    .hasAnyRole("PATIENT", "ADMIN")

                .anyRequest().authenticated()
            )
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public FilterRegistrationBean<JwtAuthenticationFilter>
            jwtFilterRegistration(JwtAuthenticationFilter filter) {

        FilterRegistrationBean<JwtAuthenticationFilter> registration =
                new FilterRegistrationBean<>(filter);

        registration.setEnabled(false);

        return registration;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
            List.of("http://127.0.0.1:5500")
        );

        configuration.setAllowedMethods(
            List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")
        );

        configuration.setAllowedHeaders(
            List.of("Authorization", "Content-Type")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
