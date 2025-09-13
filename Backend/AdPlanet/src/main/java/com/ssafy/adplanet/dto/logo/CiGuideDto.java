package com.ssafy.adplanet.dto.logo;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "CI 가이드라인")
public record CiGuideDto(
        @Schema(description = "로고 사용 가이드",
                example = "**기본 로고**\n- 메인 로고는 워드마크와 심볼을 함께 사용한다.\n- 가로형과 세로형 버전 두 가지를 제공하며, 사용 환경에 맞게 선택한다.")
        String logoGuide,

        @Schema(description = "프라이머리 컬러(hex)", example = "3D9FD8")
        String primaryColor,

        @Schema(description = "세컨더리 컬러(hex)", example = "46A9DB")
        String secondaryColor,

        @Schema(description = "중립 컬러(hex)", example = "87DEDA")
        String neutralColor,

        @Schema(description = "프라이머리 컬러 상세 가이드",
                example = "Hex\n- #4FB1BA\nRGB\n- (79, 177, 186)\nCMYK\n- (65, 10, 25, 0)\n주 사용처\n- 로고, 주요 버튼, 강조 요소")
        String primaryGuide,

        @Schema(description = "세컨더리 컬러 상세 가이드",
                example = "Hex\n- #193747\nRGB\n- (25, 55, 71)\nCMYK\n- (90, 65, 50, 40)\n주 사용처\n- 텍스트, 배경, 보조 그래픽")
        String secondaryGuide,

        @Schema(description = "중립 컬러 가이드",
                example = "Black: #000000\nWhite: #FFFFFF\nGray: #CCCCCC")
        String neutralGuide
) {}
