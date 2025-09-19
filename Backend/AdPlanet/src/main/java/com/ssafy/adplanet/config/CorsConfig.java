package com.ssafy.adplanet.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                        "http://j13d201.p.ssafy.io",    // 운영 서버(HTTP)
                        "https://j13d201.p.ssafy.io",   // 운영 서버(HTTPS)
                        "http://localhost:5173"         // 개발 서버
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Authorization", "Set-Cookie")
                .allowCredentials(true)
                .maxAge(3600);
    }
}