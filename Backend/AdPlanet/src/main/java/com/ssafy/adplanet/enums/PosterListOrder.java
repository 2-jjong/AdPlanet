package com.ssafy.adplanet.enums;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.data.domain.Sort;

@Schema(description = "정렬 기준")
public enum PosterListOrder {
    @Schema(description = "최신순") NEWEST,
    @Schema(description = "오래된 순") OLDEST;

    public Sort toSort() {
        return this == NEWEST
                ? Sort.by(Sort.Direction.DESC, "createdAt")
                : Sort.by(Sort.Direction.ASC, "createdAt");
    }
}
