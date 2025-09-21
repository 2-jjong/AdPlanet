package com.ssafy.adplanet.service.gms;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Slf4j
@Service
@RequiredArgsConstructor
public class GmsServiceImpl implements GmsService {

    @Value("${adplanet.gms.responses-url}") private String responsesUrl; // 절대 URI
    private final ObjectMapper om;
    private final WebClient gmsWebClient;

    @Override
    public PalettePayload generatePaletteByImage(String brandName, String slogan, String imageUrl) {
        try {
            ObjectNode body = buildRequestBody(brandName, slogan, imageUrl, true);
            String json = sendAndParseOnce(body, "v0:image");
            if (json == null) throw new IllegalStateException("GMS 응답 파싱 실패");

            PalettePayload p = om.readValue(stripCodeFence(json), PalettePayload.class);
            normalize(p);
            return p;

        } catch (Exception e) {
            throw new IllegalStateException("GMS 호출/파싱 오류: " + e.getMessage(), e);
        }
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

    private String sendAndParseOnce(ObjectNode body, String tag) {
        try {
            String payload = om.writeValueAsString(body);

            String respBody = gmsWebClient.post()
                    .uri(responsesUrl)
                    .bodyValue(payload)
                    .retrieve()
                    .onStatus(s -> !s.is2xxSuccessful(), res ->
                            res.bodyToMono(String.class)
                                    .defaultIfEmpty("")
                                    .flatMap(b -> {
                                        log.warn("[GMS/responses:{}] status={} body={}", tag, res.statusCode(), b);
                                        return Mono.error(new IllegalStateException(
                                                "GMS 오류 " + res.statusCode().value() + ": " +
                                                        (b.length() > 512 ? b.substring(0,512) : b)));
                                    }))
                    .bodyToMono(String.class)
                    .block();

            if (respBody == null || respBody.isBlank()) {
                log.warn("[GMS/responses:{}] 빈 응답", tag);
                return null;
            }

            JsonNode root = om.readTree(respBody);

            String out = root.path("output_text").asText(null);
            if (out != null && !out.isBlank()) return out;

            JsonNode output = root.path("output");
            if (output.isArray()) {
                for (JsonNode msg : output) {
                    JsonNode contents = msg.path("content");
                    if (!contents.isArray()) continue;
                    for (JsonNode c : contents) {
                        if (c.hasNonNull("text")) return c.get("text").asText();
                        if (c.has("json"))        return om.writeValueAsString(c.get("json"));
                        if (c.has("parsed"))      return om.writeValueAsString(c.get("parsed"));
                        if ("output_json".equals(c.path("type").asText()) && c.has("json")) {
                            return om.writeValueAsString(c.get("json"));
                        }
                    }
                }
            }
            return null;

        } catch (Exception e) {
            throw new IllegalStateException("GMS 전송/파싱 실패: " + e.getMessage(), e);
        }
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
            """.formatted(n(brandName), n(slogan));
    }

    private static String n(String s) { return (s == null || s.isBlank()) ? "-" : s; }
}
