package com.ssafy.adplanet.dto.logo;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "로고 태그 지정 요청")
public record LogoTagAssignRequest(
        @Schema(description = "로고 id", example = "1")
        @NotNull Long logoId,

        @Schema(description = "태그명", example = "자연적인")
        @NotBlank String tagName
) {}
