package com.ssafy.adplanet.service.ai;

import com.ssafy.adplanet.dto.logo.ImageConvertRequest;
import com.ssafy.adplanet.dto.logo.LogoGenerateRequest;
import com.ssafy.adplanet.enums.ImageFormat;
import com.ssafy.adplanet.exception.BusinessException;
import com.ssafy.adplanet.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeoutException;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiServiceImpl implements AiService {

    private static final String LOGO_PATH = "/api/logo/generate";
    private static final String CONVERT_PATH = "/api/converter/convert";
    private static final Duration REQ_TIMEOUT = Duration.ofSeconds(120);

    private final @Qualifier("aiWebClient") WebClient aiWebClient;

    @Value("${adplanet.ai.base-url}")
    private String aiBaseUrl; // RestTemplate용 base URL

    @Override
    public byte[] generateLogo(LogoGenerateRequest req) {
        log.info("[AI] POST {}  size={}x{} style={}", LOGO_PATH, req.width(), req.height(), req.style());

        try {
            return aiWebClient.post()
                    .uri(LOGO_PATH)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.IMAGE_PNG, MediaType.IMAGE_JPEG, MediaType.APPLICATION_OCTET_STREAM)
                    .bodyValue(req)
                    .exchangeToMono(this::handleLogoResponse)
                    .timeout(REQ_TIMEOUT)
                    .block();

        } catch (WebClientResponseException ex) {
            log.warn("[AI/generate] HTTP {} body={} headers={}",
                    ex.getRawStatusCode(), trim(ex.getResponseBodyAsString()), ex.getHeaders());
            throw new BusinessException(ErrorCode.LOGO_AI_SERVER_FAILED, ex);

        } catch (WebClientRequestException ex) {
            log.error("[AI/generate] request error: type={} msg={}",
                    ex.getClass().getSimpleName(), ex.getMessage());
            throw new BusinessException(ErrorCode.LOGO_AI_SERVER_FAILED, ex);

        } catch (RuntimeException ex) {
            Throwable root = rootCause(ex);
            if (root instanceof TimeoutException) {
                log.error("[AI/generate] timeout after {}s", REQ_TIMEOUT.getSeconds());
            } else {
                log.error("[AI/generate] unexpected error: {} - {}", root.getClass().getSimpleName(), root.getMessage());
            }
            throw new BusinessException(ErrorCode.LOGO_AI_SERVER_FAILED, ex);
        }
    }

    @Override
    public byte[] convertImage(ImageConvertRequest req) {
        byte[] bytes = req.fileBytes();
        if (bytes == null || bytes.length == 0) {
            throw new BusinessException(ErrorCode.LOGO_IMAGE_EMPTY);
        }
        log.info("[AI/convert] bytes={} fmt={} filename={}",
                bytes.length, req.targetFormat(), req.filename());

        // 파일 파트 (최소 구성)
        ByteArrayResource fileRes = new ByteArrayResource(bytes) {
            @Override public String getFilename() {
                String fn = req.filename();
                return (fn == null || fn.isBlank()) ? "image.png" : fn;
            }
        };
//
//        log.info("[AI/convert] multipart summary: field=file, filename={}, size={} bytes, part-ct=image/png",
//                fileRes.getFilename(), req.fileBytes().length);
//
//        Map<String, Object> form = new HashMap<>();
//        form.put("file", fileRes);
//        log.info("이 놈이 이상한가요 ? body={}", fileRes.getFilename());
//        HttpHeaders headers = new HttpHeaders();
//        headers.setAccept(List.of(MediaType.IMAGE_PNG, MediaType.valueOf("image/svg+xml")));
//        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(form, headers);

        // 3) 파트 헤더 (파일 파트의 Content-Type/Content-Disposition)
        HttpHeaders fileHeaders = new HttpHeaders();
        fileHeaders.setContentDispositionFormData("file", fileRes.getFilename());
        HttpEntity<Resource> filePart = new HttpEntity<>(fileRes, fileHeaders);

        // 4) multipart 바디는 MultiValueMap으로
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", filePart);
        // body.add("extra", someTextPart); // 필요 시 추가

        // 5) 전체 요청 헤더 (multipart/form-data)
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        // 이미지 바이트를 받을 거면 Accept는 생략하거나 image/* 권장
        // headers.setAccept(List.of(MediaType.ALL)); // 혹은 image/*

        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);

        String url = UriComponentsBuilder
                .fromHttpUrl(aiBaseUrl)
                .path(CONVERT_PATH)
                .queryParam("target_format", req.targetFormat().ext)
                .queryParamIfPresent("quality",
                        (req.targetFormat().isJpegLike() ? Optional.ofNullable(req.quality()) : Optional.empty()))
                .build(true)
                .toUriString();

        log.info("[AI/convert] POST {}", url);
        try {
            RestTemplate rt = new RestTemplate();
            ResponseEntity<byte[]> res = rt.postForEntity(url, request, byte[].class);

            if (!res.getStatusCode().is2xxSuccessful()) {
                log.warn("[AI/convert] non-2xx status={} headers={}", res.getStatusCode(), res.getHeaders());
                throw new BusinessException(ErrorCode.LOGO_AI_SERVER_FAILED);
            }
            byte[] responseBody = res.getBody();
            if (responseBody == null || responseBody.length == 0) throw new BusinessException(ErrorCode.LOGO_IMAGE_EMPTY);
            return responseBody;

        } catch (RestClientResponseException ex) {
            log.warn("[AI/convert] HTTP {} body={}", ex.getRawStatusCode(), trim(ex.getResponseBodyAsString()));
            throw new BusinessException(ErrorCode.LOGO_AI_SERVER_FAILED, ex);
        } catch (RuntimeException ex) {
            log.error("[AI/convert] request error: {} - {}", ex.getClass().getSimpleName(), ex.getMessage());
            throw new BusinessException(ErrorCode.LOGO_AI_SERVER_FAILED, ex);
        }
    }


    /** 2xx면 바이트 수신, 그 외는 상태/본문 로깅 후 BusinessException */
    private Mono<byte[]> handleLogoResponse(ClientResponse res) {
        HttpStatusCode status = res.statusCode();
        MediaType ct = res.headers().contentType().orElse(null);

        if (status.is2xxSuccessful()) {
            return res.bodyToMono(byte[].class)
                    .switchIfEmpty(Mono.defer(() -> {
                        log.warn("[AI/generate] empty body with 2xx (ct={})", ct);
                        return Mono.error(new BusinessException(ErrorCode.LOGO_IMAGE_EMPTY));
                    }))
                    .map(bytes -> {
                        if (bytes.length == 0) throw new BusinessException(ErrorCode.LOGO_IMAGE_EMPTY);
                        if (ct != null && !isImageLike(ct)) {
                            log.warn("[AI/generate] suspicious content-type: {}", ct);
                        }
                        return bytes;
                    });
        }

        return res.bodyToMono(String.class)
                .defaultIfEmpty("")
                .flatMap(body -> {
                    log.warn("[AI/generate] non-2xx status={} ct={} body={}",
                            status.value(), ct, trim(body));
                    return Mono.error(new BusinessException(ErrorCode.LOGO_AI_SERVER_FAILED));
                });
    }

    private boolean isImageLike(MediaType ct) {
        return MediaType.IMAGE_PNG.isCompatibleWith(ct)
                || MediaType.IMAGE_JPEG.isCompatibleWith(ct)
                || MediaType.APPLICATION_OCTET_STREAM.isCompatibleWith(ct);
    }

    private static String trim(String s) {
        if (s == null) return "";
        return s.length() > 1000 ? s.substring(0, 1000) : s;
    }

    private static Throwable rootCause(Throwable t) {
        Throwable cur = t;
        while (cur.getCause() != null && cur.getCause() != cur) {
            cur = cur.getCause();
        }
        return cur;
    }
}
