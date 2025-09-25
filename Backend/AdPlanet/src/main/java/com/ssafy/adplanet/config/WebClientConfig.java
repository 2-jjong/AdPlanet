package com.ssafy.adplanet.config;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Configuration
@Slf4j
public class WebClientConfig {

    @Bean
    public WebClient webClient() {
        return WebClient.builder()
                .codecs(c -> c.defaultCodecs().maxInMemorySize(1 * 1024 * 1024))
                .build();
    }

    @Bean
    public WebClient ssafyWebClient() {
        return WebClient.builder()
                .baseUrl("https://project.ssafy.com")
                .codecs(c -> c.defaultCodecs().maxInMemorySize(1 * 1024 * 1024))
                .build();
    }

    @Bean("aiWebClient")
    public WebClient aiWebClient(
            @Value("${adplanet.ai.base-url}") String baseUrl,
            @Value("${adplanet.ai.read-timeout-seconds:120}") int readTimeoutSeconds
    ) {
        HttpClient http = HttpClient.create()
                .wiretap(
                        "reactor.netty.http.client.HttpClient",
                        io.netty.handler.logging.LogLevel.DEBUG,
                        reactor.netty.transport.logging.AdvancedByteBufFormat.TEXTUAL
                )
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 10_000)
                .responseTimeout(Duration.ofSeconds(readTimeoutSeconds))
                .doOnConnected(c -> c
                        .addHandlerLast(new ReadTimeoutHandler(readTimeoutSeconds, TimeUnit.SECONDS))
                        .addHandlerLast(new WriteTimeoutHandler(readTimeoutSeconds, TimeUnit.SECONDS)));

        return WebClient.builder()
                .baseUrl(baseUrl)
                .clientConnector(new ReactorClientHttpConnector(http))
                .filter((request, next) -> {
                    // 요청 라인/헤더 로그
                    log.info("[AI/WebClient] {} {}", request.method(), request.url());
                    request.headers().forEach((k, v) -> log.debug("[AI/WebClient] > {}: {}", k, String.join(",", v)));
                    return next.exchange(request).doOnNext(resp -> {
                        // 응답 헤더 로그
                        log.info("[AI/WebClient] < {}", resp.statusCode());
                        resp.headers().asHttpHeaders().forEach((k, v) -> log.debug("[AI/WebClient] < {}: {}", k, String.join(",", v)));
                    });
                })
                .codecs(c -> c.defaultCodecs().maxInMemorySize(25 * 1024 * 1024))
                .build();
    }

    @Bean("gmsWebClient")
    public WebClient gmsWebClient(
            @Value("${adplanet.gms.responses-url}") String responsesUrl,
            @Value("${adplanet.gms.timeout:PT60S}") Duration timeout
    ) {
        long sec = Math.max(1, timeout.getSeconds());
        HttpClient http = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 10_000)
                .responseTimeout(Duration.ofSeconds(sec))
                .doOnConnected(c -> c
                        .addHandlerLast(new ReadTimeoutHandler(sec, TimeUnit.SECONDS))
                        .addHandlerLast(new WriteTimeoutHandler(sec, TimeUnit.SECONDS)));

        return WebClient.builder()
                .baseUrl(responsesUrl)
                .clientConnector(new ReactorClientHttpConnector(http))
                .codecs(c -> c.defaultCodecs().maxInMemorySize(5 * 1024 * 1024))
                .build();
    }
}
