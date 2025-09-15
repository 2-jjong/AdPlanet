package com.ssafy.adplanet.enums;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "포스터 스타일")
public enum PosterStyle {
    @Schema(description = "깔끔한") SIMPLE,
    @Schema(description = "흑백") MONO
}
