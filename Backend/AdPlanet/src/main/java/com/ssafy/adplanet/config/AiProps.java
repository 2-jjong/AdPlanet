package com.ssafy.adplanet.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "adplanet.ai")
public record AiProps(
        String baseUrl,
        Integer connectTimeoutMs,
        Integer readTimeoutSec
)
{ }
