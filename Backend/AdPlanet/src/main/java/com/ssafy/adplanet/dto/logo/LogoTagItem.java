package com.ssafy.adplanet.dto.logo;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "로고 태그 아이템")
public record LogoTagItem(
        @Schema(description = "태그 id", example = "1") Long tagId,
        @Schema(description = "태그명", example = "자연적인") String tagName
) {}