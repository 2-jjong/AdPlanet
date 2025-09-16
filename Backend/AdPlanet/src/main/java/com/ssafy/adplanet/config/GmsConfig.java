package com.ssafy.adplanet.config;

import com.ssafy.adplanet.external.GmsClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
public class GmsConfig {
    @Bean
    public GmsClient gmsClient(
            @Value("${gms.base-url:https://gms.ssafy.io/gmsapi/api.openai.com/v1/responses}") String baseUrl,
            @Value("${gms.api-key}") String apiKey,
            @Value("${gms.timeout-seconds:20}") int timeoutSeconds
    ) {
        return new GmsClient(baseUrl, apiKey, Duration.ofSeconds(timeoutSeconds));
    }
}
