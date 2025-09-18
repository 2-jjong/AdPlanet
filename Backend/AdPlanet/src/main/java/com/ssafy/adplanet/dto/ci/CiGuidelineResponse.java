package com.ssafy.adplanet.dto.ci;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "CI 가이드라인 응답")
public record CiGuidelineResponse(
        Long id,
        Long logoId,

        // 로고 사용 규정
        String basicLogo,          // 기본 로고 (멀티라인 문자열)
        List<String> minSize,      // 최소 사이즈 (라인 분할)
        String marginRule,         // 여백 규정
        String backgroundRule,     // 배경 규정
        String prohibitionRule,    // 로고 변형 금지

        // 팔레트(대표 색상 HEX)
        @Schema(description = "프라이머리 컬러(hex, #RRGGBB)", example = "#3D9FD8")
        String primaryColor,
        @Schema(description = "세컨더리 컬러(hex, #RRGGBB)", example = "#46A9DB")
        String secondaryColor,
        @Schema(description = "중립 컬러(hex, #RRGGBB)", example = "#87DEDA")
        String neutralColor,

        // 상세 가이드 (프론트 요구: 객체)
        ColorGuide primaryGuide,
        ColorGuide secondaryGuide,
        List<NeutralColor> neutralGuide
) {
        public record ColorGuide(
                String hex,
                String rgb,
                @JsonProperty("CMYK") String cmyk,
                String mainUsage
        ) {}

        public record NeutralColor(
                String name,
                String value
        ) {}
}
