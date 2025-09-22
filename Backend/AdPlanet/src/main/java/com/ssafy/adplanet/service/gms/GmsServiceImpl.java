package com.ssafy.adplanet.service.gms;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class GmsServiceImpl implements GmsService {

    private final @Qualifier("gmsWebClient") WebClient gmsWebClient;

    private final ObjectMapper om;

    @Value("${adplanet.gms.api-key}") private String apiKey;

    @Value("${adplanet.gms.request-timeout:PT30S}")
    private Duration requestTimeout;

    @Override
    public PalettePayload generatePaletteByImage(String brandName, String slogan, String imageUrl) {
        try {
            ObjectNode body = buildRequestBody(brandName, slogan, imageUrl, true);

            // Bean에 baseUrl이 있으므로 상대 경로만 사용
            String respBody = gmsWebClient.post()
                    .uri("/responses")
                    .headers(h -> h.setBearerAuth(apiKey))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .onStatus(s -> !s.is2xxSuccessful(), res ->
                            res.bodyToMono(String.class).defaultIfEmpty("")
                                    .flatMap(b -> {
                                        log.warn("[GMS/responses] status={} body={}", res.statusCode(), b);
                                        return Mono.error(new IllegalStateException(
                                                "GMS 오류 " + res.statusCode().value() + ": " + trim(b)));
                                    }))
                    .bodyToMono(String.class)
                    .timeout(requestTimeout)
                    .block();

            if (respBody == null || respBody.isBlank()) {
                throw new IllegalStateException("GMS 빈 응답");
            }

            // ----- 응답 파싱 -----
            JsonNode root = om.readTree(respBody);

            // (1) output_text 우선
            String out = root.path("output_text").asText(null);
            if (out != null && !out.isBlank()) {
                return postProcess(out);
            }

            // (2) output 배열 내부 content에서 text/json/parsed 추출
            JsonNode output = root.path("output");
            if (output.isArray()) {
                for (JsonNode msg : output) {
                    JsonNode contents = msg.path("content");
                    if (!contents.isArray()) continue;
                    for (JsonNode c : contents) {
                        if (c.hasNonNull("text"))  return postProcess(c.get("text").asText());
                        if (c.has("json"))          return postProcess(om.writeValueAsString(c.get("json")));
                        if (c.has("parsed"))        return postProcess(om.writeValueAsString(c.get("parsed")));
                        if ("output_json".equals(c.path("type").asText()) && c.has("json")) {
                            return postProcess(om.writeValueAsString(c.get("json")));
                        }
                    }
                }
            }
            throw new IllegalStateException("GMS 응답 파싱 실패");

        } catch (Exception e) {
            throw new IllegalStateException("GMS 호출/파싱 오류: " + e.getMessage(), e);
        }
    }

    @Override
    public String refineLogoPrompt(String brandName, String slogan, String userPrompt, String style) {
        try {
            String brand = orEmptyIfBlank(brandName);
            slogan  = orEmptyIfBlank(slogan);
            String raw   = (userPrompt == null) ? "" : userPrompt.trim();
            if (raw.length() > 2000) raw = raw.substring(0, 2000);  // 과도한 길이 방지
            String sty   = (style == null) ? "-" : style;

            // 1) 요청 바디 구성 (텍스트 출력)
            ObjectNode root = om.createObjectNode();
            root.put("model", "gpt-5-nano");

            ArrayNode input = root.putArray("input");
            ObjectNode user = input.addObject().put("role", "user");
            ArrayNode content = user.putArray("content");

            // 지시문 (영문화 + 로고용으로 구조화)
            String instruction = """
            You are a professional brand identity prompt engineer.
            Rewrite the user's Korean prompt into a concise, production-ready ENGLISH prompt specialized for LOGO generation.

            Rules:
            - Write in natural, clear English.
            - Keep it 1–4 sentences, no markdown, no quotes.
            - Include the brand name and slogan contextually (do NOT output labels).
            - Include style hints if provided (e.g., "simple", "mono", "minimal", "flat", "geometric").
            - Focus on composition, shapes, negative space, typography preferences, color hints (optional), and constraints (no photo).
            - Avoid camera/photo terms, storytelling, or long backgrounds.
            - Prefer vector-friendly wording (e.g., "clean lines", "high contrast", "scalable", "SVG-friendly").
            - Output ONLY the refined prompt text, nothing else.

            Brand: %s
            Slogan: %s
            Requested style: %s
            Original (user) prompt (Korean allowed): %s
            """.formatted(brand, slogan, sty, raw);

            content.addObject()
                    .put("type", "input_text")
                    .put("text", instruction);

            // 2) 호출
            String refined = gmsWebClient.post()
                    .uri("/responses") // baseUrl: https://api.openai.com/v1
                    .headers(h -> h.setBearerAuth(apiKey))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.TEXT_PLAIN, MediaType.APPLICATION_JSON)
                    .bodyValue(root)
                    .retrieve()
                    .onStatus(s -> !s.is2xxSuccessful(), res ->
                            res.bodyToMono(String.class).defaultIfEmpty("")
                                    .flatMap(b -> Mono.error(new IllegalStateException(
                                            "GMS 오류 " + res.statusCode().value() + ": " + trim(b)))))
                    .bodyToMono(String.class)
                    .timeout(requestTimeout)
                    .block();

            if (refined == null || refined.isBlank()) {
                throw new IllegalStateException("GMS 빈 응답(프롬프트 정제)");
            }

            // 3) 코드펜스/잡텍스트 제거 & 길이 보정
            String out = stripCodeFence(refined).trim();
            if (out.length() > 800) out = out.substring(0, 800); // 너무 길면 컷
            return out;

        } catch (Exception e) {
            throw new IllegalStateException("GMS 프롬프트 정제 실패: " + e.getMessage(), e);
        }
    }

    private PalettePayload postProcess(String json) throws Exception {
        PalettePayload p = om.readValue(stripCodeFence(json), PalettePayload.class);
        normalize(p);
        return p;
    }

    private ObjectNode buildRequestBody(String brand, String slogan, String imageUrl, boolean withImage) {
        ObjectNode root = om.createObjectNode();
        root.put("model", "gpt-5-nano");

        ArrayNode input = root.putArray("input");
        ObjectNode user = input.addObject().put("role", "user");
        ArrayNode content = user.putArray("content");

        if (withImage) {
            content.addObject().put("type", "input_image").put("image_url", imageUrl);
        }
        content.addObject()
                .put("type", "input_text")
                .put("text", buildPrompt(brand, slogan) + "\n이미지: " + imageUrl);

        ObjectNode text = root.putObject("text");
        ObjectNode format = text.putObject("format");
        format.put("type", "json_schema");
        format.put("name", "CiPalette");
        ObjectNode schema = format.putObject("schema");
        fillSchema(schema);

        return root;
    }

    private void fillSchema(ObjectNode schema) {
        schema.put("type", "object");
        schema.put("additionalProperties", false);

        ObjectNode props = schema.putObject("properties");
        props.putObject("primaryColor").put("type", "string").put("pattern", "^#[0-9A-Fa-f]{6}$");
        props.putObject("secondaryColor").put("type", "string").put("pattern", "^#[0-9A-Fa-f]{6}$");
        props.putObject("neutralColor").put("type", "string").put("pattern", "^#[0-9A-Fa-f]{6}$");

        ObjectNode colorGuide = om.createObjectNode();
        colorGuide.put("type", "object").put("additionalProperties", false);
        ObjectNode cgProps = colorGuide.putObject("properties");
        cgProps.putObject("hex").put("type", "string").put("pattern", "^#[0-9A-Fa-f]{6}$");
        cgProps.putObject("rgb").put("type", "string");
        cgProps.putObject("CMYK").put("type", "string");
        cgProps.putObject("mainUsage").put("type", "string");
        colorGuide.putArray("required").add("hex").add("rgb").add("CMYK").add("mainUsage");

        props.set("primaryGuide", colorGuide.deepCopy());
        props.set("secondaryGuide", colorGuide.deepCopy());
        props.putObject("neutralGuide").put("type", "string");

        schema.putArray("required")
                .add("primaryColor").add("secondaryColor").add("neutralColor")
                .add("primaryGuide").add("secondaryGuide").add("neutralGuide");
    }

    private static String stripCodeFence(String s) {
        if (s == null) return null;
        String t = s.trim();
        if (t.startsWith("```")) {
            int i = t.indexOf('{');
            int j = t.lastIndexOf('}');
            if (i >= 0 && j > i) return t.substring(i, j + 1);
        }
        return t;
    }

    private void normalize(PalettePayload p) {
        p.setPrimaryColor(fixHex(p.getPrimaryColor()));
        p.setSecondaryColor(fixHex(p.getSecondaryColor()));
        p.setNeutralColor(fixHex(p.getNeutralColor()));

        if (p.getPrimaryGuide() != null) {
            p.getPrimaryGuide().setHex(fixHex(p.getPrimaryGuide().getHex()));
        }
        if (p.getSecondaryGuide() != null) {
            p.getSecondaryGuide().setHex(fixHex(p.getSecondaryGuide().getHex()));
        }
    }

    private static String fixHex(String hex) {
        if (hex == null) return null;
        String h = hex.trim().toUpperCase();
        if (!h.startsWith("#")) h = "#" + h;
        return h;
    }

    private String buildPrompt(String brandName, String slogan) {
        return """
            당신은 브랜드 CI 색상 컨설턴트입니다.
            업로드된 로고 이미지를 분석해 '색상 규정'만 JSON으로 출력하세요.

            - 출력은 제공한 JSON 스키마를 정확히 준수하십시오.
              (임의 텍스트/마크다운/플레이스홀더 금지: '#HEX','RGB','CMYK','주 사용처' 등)

            - primaryColor / secondaryColor / neutralColor: #RRGGBB (대문자)

            - primaryGuide / secondaryGuide: 객체로 반환
              { "hex": "#RRGGBB", "rgb": "R, G, B", "CMYK": "C, M, Y, K", "mainUsage": "..." }

            - neutralGuide는 문자열 3줄을 반드시 포함:
              Black: #000000
              White: #FFFFFF
              Gray: #CCCCCC

            브랜드명: %s
            슬로건: %s
            """.formatted(orEmptyIfBlank(brandName), orEmptyIfBlank(slogan));
    }

    private static String orEmptyIfBlank(String s) { return (s == null || s.isBlank()) ? "" : s; }

    private static String trim(String s) {
        if (s == null) return "";
        return s.length() > 512 ? s.substring(0, 512) : s;
    }
}
