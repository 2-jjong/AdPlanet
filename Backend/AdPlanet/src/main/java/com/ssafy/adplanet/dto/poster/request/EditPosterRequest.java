package com.ssafy.adplanet.dto.poster.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "포스터 수정 요청")
public record EditPosterRequest(

        @NotBlank
        @Schema(description = "프롬프트", example = "배추 모티프, 상큼한 초록/민트톤, 미니멀 스타일")
        String prompt
) { }
