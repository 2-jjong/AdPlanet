package com.ssafy.adplanet.service.gms;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.ssafy.adplanet.exception.BusinessException;
import com.ssafy.adplanet.exception.ErrorCode;
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
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, e);
        }
    }

    @Override
    public String refineLogoPrompt(String brandName, String slogan, String userPrompt, String style) {
        try {
            String brand = orEmptyIfBlank(brandName);
            slogan  = orEmptyIfBlank(slogan);
            String raw   = (userPrompt == null) ? "" : userPrompt.trim();
            if (raw.length() > 2000) raw = raw.substring(0, 2000);
            String sty   = (style == null) ? "-" : style;

            // 1) 요청 바디 구성 (텍스트 출력)
            ObjectNode root = om.createObjectNode();
            root.put("model", "gpt-5");

            ObjectNode textNode = root.putObject("text");
            ObjectNode format   = textNode.putObject("format");
            format.put("type", "text"); // 텍스트만 반환

            ArrayNode input = root.putArray("input");
            ObjectNode user = input.addObject().put("role", "user");
            ArrayNode content = user.putArray("content");

            // 지시문 (영문화 + 로고용으로 구조화)
            String instruction = """
            You are a world-class brand identity prompt engineer specializing in Stable Diffusion XL.
            Your task is to re-engineer a user's request into a concise, comma-separated list of English keywords, meticulously crafted to generate a minimal, modern vector logo.
            
            **ABSOLUTE RULES:**
            1.  **MANDATORY PREFIX:** Every prompt MUST start with `logo, logoredmaf,`. No exceptions.
            2.  **KEYWORDS ONLY:** The output must be a single line of comma-separated English keywords. Do NOT use sentences, explanations, quotes, or markdown.
            3.  **NO BRAND NAMES:** Strictly exclude any brand, service, or project names from the final keywords.
            4.  **77 TOKEN LIMIT:** Be ruthlessly concise. The final prompt must not exceed 70 tokens to ensure optimal performance. Omit redundant or weak keywords.
            5.  **NO TEXT GENERATION:** Actively prevent the model from generating letters or text. Use keywords like `no text`, `symbolic`, `abstract icon`.
            6.  **ENGLISH ONLY:** The entire output must be in English.
            
            **DESIGN PHILOSOPHY & KEYWORD STRATEGY:**
            * **Grounded Abstraction:** Your primary goal is to translate the user's core concepts into sophisticated, abstract visual metaphors. All creative interpretations must be logically anchored to the user's original text. Elevate the idea, don't replace it. Never introduce completely irrelevant themes.
            * **Symbolism & Composition:** Identify 1-3 primary symbolic elements. Combine them into a cohesive, balanced composition. (e.g., `house outline containing a voice waveform`, `game controller merged with an ascending stock chart`). Prioritize simplicity and immediate recognition.
            * **Aesthetic & Execution:** Define a modern, premium aesthetic. Default to styles like `minimalist vector logo`, `flat icon design`, `sleek`, `clean lines`. This ensures a professional and versatile result.
            * **Color & Mood:** Select a deliberate color palette that evokes the desired brand mood. Translate user input and hex codes into evocative terms. (e.g., `vibrant blue to green gradient for 'tech' and 'growth'`, `soft pastel tones for 'comfort'`).
            * **Polish & Finish:** Apply subtle effects for a premium finish. Use keywords sparingly for emphasis, such as `digital glow`, `subtle shadow`, `neon highlights`.
            * **Application & Context:** Frame the logo's intended use to guide the AI's output. Keywords like `app icon`, `tech logo`, `fintech branding` are crucial for context-aware generation.
            * **Please make it without the modifier.
            
            **IMPROVED EXAMPLES:**
            * User: "AI가 교통 법규 위반 차량을 감지하는 다람쥐 캐릭터 서비스 '착행'. 테마색은 0xFF537FE7."
            * Output: `logo, logoredmaf, cute squirrel as a police officer, holding a speed camera, minimalist vector character, traffic enforcement concept, vibrant blue and white, clean lines, app icon, no text`
            * User: "웹 탐색 기록을 별자리처럼 시각화하는 'Starlog' 서비스."
            * Output: `logo, logoredmaf, glowing constellation, interconnected dots and lines, abstract data visualization, deep navy background, neon blue and white glow, minimalist vector, tech logo, modern, no text`
            * User: "누구나 쉽게 이해할 수 있는 모니터링 리포트 서비스 로고. 전문성과 접근성을 동시에 표현."
            * Output: `logo, logoredmaf, glowing gradient bar chart, upward trend arrow, modern fintech logo, neon blue and purple, flat minimalist vector, dark background, clean and simple design, no text`
            * User: "논문 탐색 서비스 'RSP'. AI, 과학, 혁신을 상징하며, 청색 계열을 사용."
            * Output: `logo, logoredmaf, abstract brain, neural network, open book, magnifying glass, digital connectivity, glowing blue gradient, scientific innovation, tech logo, minimalist vector, app icon, no text`
            * User: "임산부 케어 앱. '따뜻한 보호, 편안한 동반자' 컨셉. 엄마와 태아 실루엣, 하트 모양."
            * Output: `logo, logoredmaf, mother and fetus silhouette, abstract heart shape, gentle smooth lines, warm protection concept, soft pastel tones, butter yellow, apricot pink, modern minimal style, app icon, no text`
            * User: "음성으로 제어하는 스마트 홈 프로젝트. IoT 기기 제어 및 자동화."
            * Output: `logo, logoredmaf, smart home app icon, house outline, central voice waveform, iot device symbols, automation arrows, vibrant blue to green gradient, digital glow, dark navy background, no text`
            * User: "실시간 주식 데이터 기반 모의 투자 게임 플랫폼 '주연'."
            * Output: `logo, logoredmaf, game controller merged with ascending stock chart arrow, gold coin accent, fintech gaming concept, modern vector logo, vibrant gradient, digital glow, dark background, no text`
            
            **User's raw prompt (Korean allowed):**
            %s
            """.formatted(raw);


            content.addObject()
                    .put("type", "input_text")
                    .put("text", instruction);

            String respBody = gmsWebClient.post()
                    .uri("/responses")
                    .headers(h -> h.setBearerAuth(apiKey))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .bodyValue(root)
                    .retrieve()
                    .onStatus(s -> !s.is2xxSuccessful(), res ->
                            res.bodyToMono(String.class).defaultIfEmpty("")
                                    .flatMap(b -> Mono.error(new IllegalStateException(
                                            "GMS 오류 " + res.statusCode().value() + ": " + trim(b)))))
                    .bodyToMono(String.class)
                    .timeout(requestTimeout)
                    .block();

            if (respBody == null || respBody.isBlank()) {
                throw new IllegalStateException("GMS 빈 응답(프롬프트 정제)");
            }

            JsonNode rootJson = om.readTree(respBody);
            String out = extractFirstTextFromGms(rootJson);
            if (out == null || out.isBlank()) {
                out = stripCodeFence(respBody).trim();
            }

            out = finalizeSdKeywords(out, brand, slogan, 77);

            if (out.length() > 800) out = out.substring(0, 800);
            return out;

        } catch (Exception e) {
            throw new BusinessException(ErrorCode.LOGO_PROMPT_REFINEMENT_FAILED, e);
        }
    }

    private String extractFirstTextFromGms(JsonNode root) throws Exception {
        String out = root.path("output_text").asText(null);
        if (out != null && !out.isBlank()) return stripCodeFence(out).trim();

        JsonNode output = root.path("output");
        if (output.isArray()) {
            for (JsonNode msg : output) {
                JsonNode contents = msg.path("content");
                if (!contents.isArray()) continue;
                for (JsonNode c : contents) {
                    if (c.hasNonNull("text"))  return stripCodeFence(c.get("text").asText()).trim();
                    if (c.hasNonNull("json"))  return om.writeValueAsString(c.get("json"));
                    if (c.hasNonNull("parsed"))return om.writeValueAsString(c.get("parsed"));
                    if ("output_json".equals(c.path("type").asText()) && c.has("json")) {
                        return om.writeValueAsString(c.get("json"));
                    }
                }
            }
        }
        return null;
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

    private static String orEmptyIfBlank(String s) { return (s == null || s.isBlank()) ? null : s; }

    private static String trim(String s) {
        if (s == null) return "";
        return s.length() > 512 ? s.substring(0, 512) : s;
    }

    @Override
    public String generateCopyByImage(String brandName, String slogan, String imageUrl) {
        try {
            ObjectNode root = om.createObjectNode();
            root.put("model", "gpt-5-nano");

            ArrayNode input = root.putArray("input");
            ObjectNode user = input.addObject().put("role", "user");
            ArrayNode content = user.putArray("content");

            content.addObject().put("type", "input_image").put("image_url", imageUrl);
            content.addObject()
                    .put("type", "input_text")
                    .put("text", """
                당신은 전문 카피라이터입니다.
                업로드된 포스터 이미지에 들어갈 카피 문구를 만들어주세요.
                소비자에게 매력적으로 다가갈 수 있는 짧고 굵은 한 줄로 만들어주세요.

                - 브랜드명: %s
                - 슬로건: %s
                - 결과는 한국어로, 1문장.
                """.formatted(orEmptyIfBlank(brandName), orEmptyIfBlank(slogan)));

            String respBody = gmsWebClient.post()
                    .uri("/responses")
                    .headers(h -> h.setBearerAuth(apiKey))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .bodyValue(root)
                    .retrieve()
                    .onStatus(s -> !s.is2xxSuccessful(), res ->
                            res.bodyToMono(String.class).defaultIfEmpty("")
                                    .flatMap(b -> Mono.error(new IllegalStateException(
                                            "GMS 오류 " + res.statusCode().value() + ": " + trim(b)))))
                    .bodyToMono(String.class)
                    .timeout(requestTimeout)
                    .block();

            if (respBody == null || respBody.isBlank()) {
                throw new IllegalStateException("GMS 빈 응답(카피)");
            }
            log.info("[GMS Response Raw] {}", respBody);

            JsonNode rootNode = om.readTree(respBody);
            log.info("[GMS Response Output] {}", rootNode.path("output"));
            String text = rootNode.path("output_text").asText("생성 실패");

            if (!text.equals("생성 실패")) {
                log.info("[GMS Response Text] {}", text);
                return text;
            }

            JsonNode output = rootNode.path("output");
            if (output.isArray()) {
                for (JsonNode msg : output) {
                    JsonNode contents = msg.path("content");
                    if (!contents.isArray()) continue;
                    for (JsonNode c : contents) {
                        String type = c.path("type").asText();
                        if ("output_text".equals(type)) {
                            text = c.path("text").asText();
                            log.info("[GMS Response Text] {}", text);
                            return text;
                        }
                    }
                }
            }

            throw new BusinessException(ErrorCode.COPY_GENERATION_FAILED);

        } catch (Exception e) {
            throw new BusinessException(ErrorCode.COPY_GENERATION_FAILED);
        }
    }

    private static int countWords(String s) {
        if (s == null || s.isBlank()) return 0;
        var m = java.util.regex.Pattern.compile("[\\p{L}\\p{N}\\-\\+]+").matcher(s);
        int c = 0; while (m.find()) c++; return c;
    }

    private static java.util.List<String> splitPhrases(String raw) {
        if (raw == null) return java.util.Collections.emptyList();
        String s = raw.replace("```","").replace("\r",",").replace("\n",",")
                .replace(";",",").replace("·",",").replace("|",",")
                .replaceAll("\\s+"," ").trim();
        String[] arr = s.split(",");
        java.util.ArrayList<String> list = new java.util.ArrayList<>();
        for (String a : arr) { String t = a.trim(); if (!t.isEmpty()) list.add(t); }
        return list;
    }

    private static String joinPhrases(java.util.List<String> phrases) {
        return String.join(", ", phrases);
    }

    private static String sanitizeBrandAndSlogan(String text, String brand, String slogan) {
        if (text == null) return null;
        String out = text;

        if (brand != null && !brand.isBlank()) {
            String b = java.util.regex.Pattern.quote(brand);
            out = out.replaceAll("(?i)\\b" + b + "\\b", "brand");
            out = out.replaceAll("(?i)(for|of|by|with)\\s+" + b + "\\b", "$1 brand");
        }
        if (slogan != null && !slogan.isBlank()) {
            String s = java.util.regex.Pattern.quote(slogan);
            out = out.replaceAll("(?i)" + s, "");
            out = out.replaceAll("(?i)\\bwith\\s+the\\s+slogan\\b[^,]*", "");
        }
        return out.replaceAll("\\s{2,}", " ").trim();
    }

    private static String takeFirstNWords(String phrase, int n) {
        if (n <= 0) return "";
        var m = java.util.regex.Pattern.compile("[\\p{L}\\p{N}\\-\\+]+").matcher(phrase);
        StringBuilder sb = new StringBuilder(); int c = 0;
        while (m.find() && c < n) { if (sb.length() > 0) sb.append(' '); sb.append(m.group()); c++; }
        return sb.toString().trim();
    }

    private static String finalizeSdKeywords(String modelOut, String brand, String slogan, int wordBudget) {
        java.util.LinkedHashSet<String> uniq = new java.util.LinkedHashSet<>();
        for (String p : splitPhrases(modelOut)) {
            String t = sanitizeBrandAndSlogan(p, brand, slogan);
            if (t.isBlank()) continue;
            String tl = t.toLowerCase();
            if (tl.contains("photo") || tl.contains("photograph") || tl.contains("camera")) continue;
            t = t.replace(".", "").trim();
            if (!t.isEmpty()) uniq.add(t);
            if (uniq.size() > 128) break;
        }

        java.util.ArrayList<String> list = new java.util.ArrayList<>(uniq);
        int used = 0;
        java.util.ArrayList<String> kept = new java.util.ArrayList<>();
        for (String phrase : list) {
            int w = countWords(phrase);
            if (used + w <= wordBudget) {
                kept.add(phrase);
                used += w;
            } else {
                break;
            }
        }

        if (used < wordBudget && !list.isEmpty() && kept.size() < list.size()) {
            String next = list.get(kept.size());
            int remain = wordBudget - used;
            if (remain > 0) {
                String trimmed = takeFirstNWords(next, remain);
                if (!trimmed.isBlank()) kept.add(trimmed);
            }
        }

        return joinPhrases(kept);
    }
}
