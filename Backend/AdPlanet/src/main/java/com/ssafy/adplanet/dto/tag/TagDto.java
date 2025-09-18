package com.ssafy.adplanet.dto.tag;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "태그 정보")
public record TagDto(
        @Schema(description = "태그 id", example = "1")
        Long id,

        @Schema(description = "태그 이름", example = "자연스러움")
        String name
) { }
