package com.ssafy.adplanet.dto.logo;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "로고 상세")
public record LogoDetail(
        @Schema(description = "제목", example = "싸피컴퍼니")
        String name,

        @Schema(description = "설명(슬로건)", example = "포기는 배추 셀 때나 하는 말")
        String slogan,

        @Schema(description = "이미지 URL", example = "images/logo_1")
        String imgUrl,

        @Schema(description = "프롬프트", example = "아삭아삭한 배추 이미지, 싱싱한 초록색 활용")
        String prompt
) {}
