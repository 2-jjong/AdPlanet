package com.ssafy.adplanet.dto.tag;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "태그 생성 요청")
public record CreateTagRequest(
        @NotBlank
        @Schema(description = "태그 이름", example = "자연스러운")
        String name
) { }
