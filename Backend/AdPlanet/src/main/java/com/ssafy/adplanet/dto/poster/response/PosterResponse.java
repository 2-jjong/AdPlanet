package com.ssafy.adplanet.dto.poster.response;

import io.swagger.v3.oas.annotations.media.Schema;

public record PosterResponse (

    @Schema(description = "포스터 id", example = "1")
    Long posterId,

    @Schema(description = "이미지 url", example = "https://...")
    String imgUrl
){}
