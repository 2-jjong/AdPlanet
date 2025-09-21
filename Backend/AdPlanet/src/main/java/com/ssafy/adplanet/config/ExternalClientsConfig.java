package com.ssafy.adplanet.config;

import com.ssafy.adplanet.external.AiClient;
import com.ssafy.adplanet.external.AiHttp;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
public class ExternalClientsConfig {

    @Bean
    public AiHttp aiHttp(
            @Value("${adplanet.ai.base-url}") String baseUrl,
            @Value("${adplanet.ai.read-timeout-seconds:120}") int readTimeoutSeconds
    ) {
        return new AiHttp(baseUrl, Duration.ofSeconds(readTimeoutSeconds));
    }

    @Bean
    public AiClient aiClient(AiHttp http) {
        return new AiClient(http);
    }
}
