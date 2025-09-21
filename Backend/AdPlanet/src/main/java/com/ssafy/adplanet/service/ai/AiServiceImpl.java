package com.ssafy.adplanet.service.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.adplanet.dto.logo.LogoGenerateRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Slf4j
@RequiredArgsConstructor
public class AiServiceImpl implements AiService {

    private static final String LOGO_PATH = "/api/logo/generate";
    private final WebClient aiWebClient;
    private final ObjectMapper om = new ObjectMapper();

    @Override
    public byte[] generateLogo(LogoGenerateRequest req) {
        try {
            String json = om.writeValueAsString(req);
            log.info("[AI] POST {} title={} size={}x{} style={}",
                    LOGO_PATH, req.title(), req.width(), req.height(), req.style());

            return aiWebClient.post()
                    .uri(LOGO_PATH)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.IMAGE_PNG, MediaType.IMAGE_JPEG)
                    .bodyValue(json)
                    .retrieve()
                    .onStatus(s -> !s.is2xxSuccessful(), resp ->
                            resp.bodyToMono(byte[].class).defaultIfEmpty(new byte[0]).flatMap(b -> {
                                String snippet = new String(b, 0, Math.min(b.length, 256));
                                return Mono.error(new IllegalStateException(
                                        "AI 서버 오류(" + resp.statusCode().value() + "): " + snippet));
                            }))
                    .bodyToMono(byte[].class)
                    .block();
        } catch (Exception e) {
            log.error("[AI] generateLogo 실패: {}", e.toString(), e);
            throw new IllegalStateException("AI 서버 호출 실패: " + e.getMessage(), e);
        }
    }
}
