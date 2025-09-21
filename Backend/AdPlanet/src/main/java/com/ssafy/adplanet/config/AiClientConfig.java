package com.ssafy.adplanet.config;

import com.ssafy.adplanet.service.ai.AiService;
import com.ssafy.adplanet.service.ai.AiServiceImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class AiClientConfig {
    @Bean
    public AiService aiClient(WebClient aiWebClient) {
        return new AiServiceImpl(aiWebClient);
    }
}