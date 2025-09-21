package com.ssafy.adplanet.dto.logo;

import com.ssafy.adplanet.enums.LogoStyle;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

@Schema(description = "로고 생성 요청")
public record CreateLogoRequest(
        @NotBlank
        @Schema(description = "로고 제목", example = "싸피컴퍼니")
        String title,

        @Schema(
                description = "설명/슬로건(선택)",
                example = "포기는 배추 셀 때나 하는 말",
                requiredMode = Schema.RequiredMode.NOT_REQUIRED
        )
        String content,

        @NotBlank
        @Schema(description = "이미지 생성 프롬프트", example = "green cabbage, fresh, crisp, minimal logo")
        String prompt,

        @NotNull
        @Schema(description = "로고 스타일", example = "SIMPLE")
        LogoStyle style,

        @Schema(description = "로고 태그")
        List<Long> tagIds
) {}
