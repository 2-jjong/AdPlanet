package com.ssafy.adplanet.service.ai;

import com.ssafy.adplanet.dto.logo.LogoGenerateRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiServiceImpl implements AiService {

    private static final String LOGO_PATH = "/api/logo/generate";
    private static final Duration REQ_TIMEOUT = Duration.ofSeconds(120);

    private final @Qualifier("aiWebClient") WebClient aiWebClient;

    @Override
    public byte[] generateLogo(LogoGenerateRequest req) {
        log.info("[AI] POST {} title='{}' size={}x{} style={}",
                LOGO_PATH, req.title(), req.width(), req.height(), req.style());

        return aiWebClient.post()
                .uri(LOGO_PATH)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.IMAGE_PNG, MediaType.IMAGE_JPEG)
                .bodyValue(req) // ← ObjectMapper 직접 사용 불필요
                .retrieve()
                .onStatus(s -> !s.is2xxSuccessful(), resp ->
                        resp.bodyToMono(String.class).defaultIfEmpty("")
                                .flatMap(b -> Mono.error(new IllegalStateException(
                                        "AI generate 실패 " + resp.statusCode().value() + " : " + trim(b)))))
                .bodyToMono(byte[].class)
                .timeout(REQ_TIMEOUT) // 요청별 타임아웃
                .block();
    }

    private static String trim(String s) {
        if (s == null) return "";
        return s.length() > 256 ? s.substring(0, 256) : s;
    }
}
