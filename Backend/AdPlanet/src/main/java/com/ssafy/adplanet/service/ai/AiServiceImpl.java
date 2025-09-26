package com.ssafy.adplanet.service.ai;

import com.ssafy.adplanet.dto.logo.LogoGenerateRequest;
import com.ssafy.adplanet.dto.poster.request.GeneratePosterRequest;
import com.ssafy.adplanet.exception.BusinessException;
import com.ssafy.adplanet.exception.ErrorCode;
import com.ssafy.adplanet.service.s3.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.concurrent.TimeoutException;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiServiceImpl implements AiService {

    private static final String LOGO_PATH = "/api/logo/generate";
    private static final String POSTER_GENERATE_PATH = "/api/poster/generate";
    private static final String POSTER_EDIT_PATH = "/api/poster/edit";
    private static final Duration REQ_TIMEOUT = Duration.ofSeconds(120);

    private final @Qualifier("aiWebClient") WebClient aiWebClient;

    private final S3Service s3Service;

    @Override
    public byte[] generateLogo(LogoGenerateRequest req) {
        log.info("[AI] POST {}  size={}x{} style={}",
                LOGO_PATH, req.width(), req.height(), req.style());

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
            // 서버가 4xx/5xx를 정상 응답으로 반환한 경우
            log.warn("[AI/generate] HTTP {} body={} headers={}",
                    ex.getRawStatusCode(), trim(ex.getResponseBodyAsString()), ex.getHeaders());
            throw new BusinessException(ErrorCode.LOGO_AI_SERVER_FAILED, ex);

        } catch (WebClientRequestException ex) {
            // 네트워크/연결 오류(Connect, DNS, SSL 등) 모두 여기로 들어옴
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

    /**
     * 2xx면 바이트 수신, 그 외는 상태/본문 로깅 후 BusinessException
     */
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
                        if (bytes.length == 0) {
                            throw new BusinessException(ErrorCode.LOGO_IMAGE_EMPTY);
                        }
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

    @Override
    public byte[] generatePoster(GeneratePosterRequest request) {
        log.info("[AI] POST {}", POSTER_GENERATE_PATH);

        try {
            MultipartBodyBuilder builder = new MultipartBodyBuilder();

            // 텍스트 필드
            builder.part("prompt", request.prompt());

            // 이미지 필드
            if (request.poseImage() != null) {
                builder.part("pose_image", new ByteArrayResource(request.poseImage()) {
                    @Override
                    public String getFilename() {
                        return "pose.png";
                    }
                }).contentType(MediaType.IMAGE_PNG);
            }

            if (request.productImage() != null) {
                builder.part("product_image", new ByteArrayResource(request.productImage()) {
                    @Override
                    public String getFilename() {
                        return "product.png";
                    }
                }).contentType(MediaType.IMAGE_PNG);
            }

            if (request.modelImage() != null) {
                builder.part("person_image", new ByteArrayResource(request.modelImage()) {
                    @Override
                    public String getFilename() {
                        return "person.png";
                    }
                }).contentType(MediaType.IMAGE_PNG);
            }

            return aiWebClient.post()
                    .uri(POSTER_GENERATE_PATH)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .accept(MediaType.IMAGE_PNG, MediaType.IMAGE_JPEG)
                    .body(BodyInserters.fromMultipartData(builder.build()))
                    .exchangeToMono(this::handlePosterResponse)
                    .timeout(REQ_TIMEOUT)
                    .block();

        } catch (WebClientResponseException ex) {
            // 서버가 4xx/5xx를 정상 응답으로 반환한 경우
            log.warn("[AI/generate] HTTP {} body={} headers={}",
                    ex.getRawStatusCode(), trim(ex.getResponseBodyAsString()), ex.getHeaders());
            throw new BusinessException(ErrorCode.POSTER_AI_SERVER_FAILED, ex);

        } catch (WebClientRequestException ex) {
            // 네트워크/연결 오류(Connect, DNS, SSL 등) 모두 여기로 들어옴
            log.error("[AI/generate] request error: type={} msg={}",
                    ex.getClass().getSimpleName(), ex.getMessage());
            throw new BusinessException(ErrorCode.POSTER_AI_SERVER_FAILED, ex);

        } catch (RuntimeException ex) {
            Throwable root = rootCause(ex);
            if (root instanceof TimeoutException) {
                log.error("[AI/generate] timeout after {}s", REQ_TIMEOUT.getSeconds());
            } else {
                log.error("[AI/generate] unexpected error: {} - {}", root.getClass().getSimpleName(), root.getMessage());
            }
            throw new BusinessException(ErrorCode.POSTER_AI_SERVER_FAILED, ex);
        }
    }

    @Override
    public byte[] editPoster(String prompt, byte[] previousImage) {
        log.info("[AI] POST {}", POSTER_GENERATE_PATH);

        try {
            MultipartBodyBuilder builder = new MultipartBodyBuilder();

            // 텍스트 필드
            builder.part("prompt", prompt);

            // 이미지 필드
            builder.part("previous_image", new ByteArrayResource(previousImage) {
                @Override
                public String getFilename() {
                    return "previous.png";
                }
            }).contentType(MediaType.IMAGE_PNG);

            return aiWebClient.post()
                    .uri(POSTER_EDIT_PATH)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .accept(MediaType.IMAGE_PNG, MediaType.IMAGE_JPEG)
                    .body(BodyInserters.fromMultipartData(builder.build()))
                    .exchangeToMono(this::handlePosterResponse)
                    .timeout(REQ_TIMEOUT)
                    .block();

        } catch (WebClientResponseException ex) {
            // 서버가 4xx/5xx를 정상 응답으로 반환한 경우
            log.warn("[AI/generate] HTTP {} body={} headers={}",
                    ex.getRawStatusCode(), trim(ex.getResponseBodyAsString()), ex.getHeaders());
            throw new BusinessException(ErrorCode.POSTER_AI_SERVER_FAILED, ex);

        } catch (WebClientRequestException ex) {
            // 네트워크/연결 오류(Connect, DNS, SSL 등) 모두 여기로 들어옴
            log.error("[AI/generate] request error: type={} msg={}",
                    ex.getClass().getSimpleName(), ex.getMessage());
            throw new BusinessException(ErrorCode.POSTER_AI_SERVER_FAILED, ex);

        } catch (RuntimeException ex) {
            Throwable root = rootCause(ex);
            if (root instanceof TimeoutException) {
                log.error("[AI/generate] timeout after {}s", REQ_TIMEOUT.getSeconds());
            } else {
                log.error("[AI/generate] unexpected error: {} - {}", root.getClass().getSimpleName(), root.getMessage());
            }
            throw new BusinessException(ErrorCode.POSTER_AI_SERVER_FAILED, ex);
        }
    }

    /**
     * 2xx면 바이트 수신, 그 외는 상태/본문 로깅 후 BusinessException
     */
    private Mono<byte[]> handlePosterResponse(ClientResponse res) {
        HttpStatusCode status = res.statusCode();
        MediaType ct = res.headers().contentType().orElse(null);

        if (status.is2xxSuccessful()) {
            return res.bodyToMono(byte[].class)
                    .switchIfEmpty(Mono.defer(() -> {
                        log.warn("[AI/generate] empty body with 2xx (ct={})", ct);
                        return Mono.error(new BusinessException(ErrorCode.POSTER_IMAGE_EMPTY));
                    }))
                    .map(bytes -> {
                        if (bytes.length == 0) {
                            throw new BusinessException(ErrorCode.POSTER_IMAGE_EMPTY);
                        }
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
                    return Mono.error(new BusinessException(ErrorCode.POSTER_AI_SERVER_FAILED));
                });
    }
}
