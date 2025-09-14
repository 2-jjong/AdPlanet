package com.ssafy.adplanet.dto.poster.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

public record PosterGroupResponse(

    @Schema(description = "포스터 그룹 id", example = "1")
    Long posterGroupId,

    @Schema(description = "대표 이미지 url", example = "https://...")
    String imgUrl,

    @Schema(description = "생성 일시", example = "2025-09-13T10:00:00Z")
    LocalDateTime createdAt
){

}
