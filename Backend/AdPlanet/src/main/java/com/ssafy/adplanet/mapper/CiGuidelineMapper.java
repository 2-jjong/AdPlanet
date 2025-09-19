package com.ssafy.adplanet.mapper;

import com.ssafy.adplanet.dto.ci.CiGuidelineResponse;
import com.ssafy.adplanet.entity.CiGuideline;
import com.ssafy.adplanet.entity.CiGuidelineTemplate;

import java.awt.Color;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public final class CiGuidelineMapper {
    private CiGuidelineMapper() {}

    public static CiGuidelineResponse toResponse(CiGuideline e) {
        CiGuidelineTemplate t = e.getTemplate();

        // 대표 색상 보정
        String primaryHex   = fixHex(e.getPrimaryColor());
        String secondaryHex = fixHex(e.getSecondaryColor());
        String neutralHex   = fixHex(e.getNeutralColor());

        // 상세 가이드: 문자열 블록 → 구조화
        var primaryGuide   = parseColorGuide(e.getPrimaryGuide(), primaryHex, "로고, 주요 버튼, 강조 요소");
        var secondaryGuide = parseColorGuide(e.getSecondaryGuide(), secondaryHex, "텍스트, 보조 그래픽, 포스터 구성 요소");
        var neutralGuide   = parseNeutralGuide(e.getNeutralGuide());

        return new CiGuidelineResponse(
                e.getId(),
                e.getLogo().getId(),

                normalizeBlock(t.getBasicLogoRule()),
                splitLines(t.getMinSizeRule()),
                normalizeBlock(t.getMarginRule()),
                normalizeBlock(t.getBackgroundRule()),
                normalizeBlock(t.getProhibitionRule()),

                primaryHex,
                secondaryHex,
                neutralHex,

                primaryGuide,
                secondaryGuide,
                neutralGuide
        );
    }

    // ----- 문자열 블록 정리/분해 -----
    private static String normalizeBlock(String s) {
        if (s == null) return null;
        var lines = Arrays.stream(s.strip().split("\\R"))
                .map(String::trim)
                .filter(l -> !l.isEmpty())
                .toList();
        return String.join("\n", lines);
    }

    private static List<String> splitLines(String s) {
        if (s == null || s.isBlank()) return List.of();
        return Arrays.stream(s.strip().split("\\R"))
                .map(String::trim)
                .filter(l -> !l.isEmpty())
                .toList();
    }

    // ----- 상세 컬러 가이드 파서 -----
    private static CiGuidelineResponse.ColorGuide parseColorGuide(String block, String fallbackHex, String fallbackUsage) {
        String hex = null, rgb = null, cmyk = null, usage = null;

        if (block != null && !block.isBlank()) {
            for (String raw : block.strip().split("\\R")) {
                String line = raw.trim();
                if (line.isEmpty()) continue;
                String lower = line.toLowerCase();

                if (lower.startsWith("hex")) {
                    hex = rightOfDash(line);
                } else if (lower.startsWith("rgb")) {
                    rgb = stripParens(rightOfDash(line));
                } else if (lower.startsWith("cmyk")) {
                    cmyk = stripParens(rightOfDash(line));
                } else if (lower.startsWith("주 사용처") || lower.startsWith("mainusage")) {
                    usage = rightOfDash(line);
                }
            }
        }

        // 플레이스홀더/부적합 값 필터링
        if (isPlaceholder(hex) || !isHex(hex)) hex = null;
        if (isPlaceholder(rgb) || !looksRgb(rgb)) rgb = null;
        if (isPlaceholder(cmyk) || !looksCmyk(cmyk)) cmyk = null;
        if (isPlaceholder(usage)) usage = null;

        // 보정
        if (hex == null || hex.isBlank()) hex = fallbackHex;
        hex = fixHex(hex);

        if (rgb == null)  rgb  = hexToRgb(hex);
        if (cmyk == null) cmyk = hexToCmyk(hex);
        if (usage == null || usage.isBlank()) usage = fallbackUsage;

        return new CiGuidelineResponse.ColorGuide(hex, rgb, cmyk, usage);
    }

    // ----- 뉴트럴 가이드 파서: "Black: #000000" 라인들 → 리스트 -----
    private static List<CiGuidelineResponse.NeutralColor> parseNeutralGuide(String block) {
        if (block == null || block.isBlank()) return List.of();
        List<CiGuidelineResponse.NeutralColor> list = new ArrayList<>();
        for (String raw : block.strip().split("\\R")) {
            String line = raw.trim();
            if (line.isEmpty()) continue;
            int idx = line.indexOf(':');
            if (idx <= 0) continue;
            String name = line.substring(0, idx).trim();
            String value = fixHex(line.substring(idx + 1).trim());
            list.add(new CiGuidelineResponse.NeutralColor(name, value));
        }
        return list;
    }

    // ----- 보조 유틸 -----
    private static String rightOfDash(String s) {
        int i = s.indexOf('-');
        String v = (i >= 0) ? s.substring(i + 1).trim() : s.trim();
        return v.replaceFirst("^[:\\-\\s]+", "").trim();
    }
    private static String stripParens(String s) {
        if (s == null) return null;
        return s.replaceAll("[()]", "").trim();
    }
    private static boolean isPlaceholder(String s) {
        if (s == null) return true;
        String t = s.trim();
        return t.isEmpty()
                || t.equalsIgnoreCase("#HEX")
                || t.equalsIgnoreCase("HEX")
                || t.equalsIgnoreCase("RGB")
                || t.equalsIgnoreCase("CMYK")
                || t.equals("주 사용처")
                || t.equalsIgnoreCase("mainUsage");
    }
    private static boolean isHex(String s) {
        return s != null && s.trim().matches("(?i)^#[0-9A-F]{6}$");
    }
    private static boolean looksRgb(String s) {
        return s != null && s.trim().matches("^\\s*\\d{1,3}\\s*,\\s*\\d{1,3}\\s*,\\s*\\d{1,3}\\s*$");
    }
    private static boolean looksCmyk(String s) {
        return s != null && s.trim().matches("^\\s*\\d{1,3}\\s*,\\s*\\d{1,3}\\s*,\\s*\\d{1,3}\\s*,\\s*\\d{1,3}\\s*$");
    }

    private static String fixHex(String hex) {
        if (hex == null || hex.isBlank()) return null;
        String h = hex.trim().toUpperCase();
        if (!h.startsWith("#")) h = "#" + h;
        if (h.matches("^#[0-9A-F]{3}$")) { // #RGB → #RRGGBB
            char r = h.charAt(1), g = h.charAt(2), b = h.charAt(3);
            h = "#" + r + r + g + g + b + b;
        }
        return h;
    }
    private static String hexToRgb(String hex) {
        Color c = Color.decode(hex);
        return c.getRed() + ", " + c.getGreen() + ", " + c.getBlue();
    }
    private static String hexToCmyk(String hex) {
        Color c = Color.decode(hex);
        float r = c.getRed()/255f, g = c.getGreen()/255f, b = c.getBlue()/255f;
        float k = 1f - Math.max(r, Math.max(g, b));
        if (k >= 0.999f) return "0, 0, 0, 100";
        float denom = 1f - k;
        int C = Math.round((1 - r - k) / denom * 100);
        int M = Math.round((1 - g - k) / denom * 100);
        int Y = Math.round((1 - b - k) / denom * 100);
        int K = Math.round(k * 100);
        return C + ", " + M + ", " + Y + ", " + K;
    }
}
