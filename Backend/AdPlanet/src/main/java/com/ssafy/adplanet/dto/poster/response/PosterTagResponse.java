package com.ssafy.adplanet.dto.poster.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "포스터 태그")
public record PosterTagResponse(

    @Schema(description = "포스터 태그 id", example = "1")
    Long tagId,

    @Schema(description = "태그명", example = "자연적인")
    String tagName
){
}
