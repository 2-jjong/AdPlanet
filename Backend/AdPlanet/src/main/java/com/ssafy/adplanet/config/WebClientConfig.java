package com.ssafy.adplanet.config;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.netty.http.client.HttpClient;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient webClient() {
        return WebClient.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(1024 * 1024))
                .build();
    }

    @Bean
    public WebClient ssafyWebClient() {
        return WebClient.builder()
                .baseUrl("https://project.ssafy.com")
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(1024 * 1024))
                .build();
    }

    @Bean
    public WebClient aiWebClient(
            @Value("${adplanet.ai.base-url}") String baseUrl,
            @Value("${adplanet.ai.read-timeout-seconds:120}") int readTimeoutSeconds
    ) {
        var http = reactor.netty.http.client.HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 10_000)
                .responseTimeout(Duration.ofSeconds(readTimeoutSeconds))
                .doOnConnected(c -> c
                        .addHandlerLast(new ReadTimeoutHandler(readTimeoutSeconds, TimeUnit.SECONDS))
                        .addHandlerLast(new WriteTimeoutHandler(readTimeoutSeconds, TimeUnit.SECONDS)));

        return WebClient.builder()
                .baseUrl(baseUrl)
                .clientConnector(new ReactorClientHttpConnector(http))
                .codecs(c -> c.defaultCodecs().maxInMemorySize(25 * 1024 * 1024))
                .build();
    }

    @Bean
    public WebClient gmsWebClient(
            @Value("${adplanet.gms.responses-url}") String responsesUrl,
            @Value("${adplanet.gms.api-key}") String apiKey,
            @Value("${adplanet.gms.timeout:PT60S}") Duration timeout
    ) {
        long readTimeoutSec = Math.max(1, timeout.getSeconds());
        HttpClient http = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 10_000)
                .responseTimeout(Duration.ofSeconds(readTimeoutSec))
                .doOnConnected(c -> c
                        .addHandlerLast(new ReadTimeoutHandler(readTimeoutSec, TimeUnit.SECONDS))
                        .addHandlerLast(new WriteTimeoutHandler(readTimeoutSec, TimeUnit.SECONDS)));

        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(http))
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .codecs(c -> c.defaultCodecs().maxInMemorySize(5 * 1024 * 1024))
                .build();
    }

}