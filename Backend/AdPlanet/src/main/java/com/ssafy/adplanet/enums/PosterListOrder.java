package com.ssafy.adplanet.enums;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "정렬 기준")
public enum PosterListOrder {
    @Schema(description = "최신순") NEWEST,
    @Schema(description = "오래된 순") OLDEST
}
