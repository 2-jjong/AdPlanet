package com.ssafy.adplanet.dto.ci;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "CI 가이드라인 생성 요청(기본값으로 저장)")
public record CreateCiGuidelineRequest(
        @NotNull
        @Schema(description = "가이드라인을 생성할 로고 ID", example = "1")
        Long logoId
) { }
