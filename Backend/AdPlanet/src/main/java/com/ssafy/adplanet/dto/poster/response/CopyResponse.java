package com.ssafy.adplanet.dto.poster.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "포스터 문구")
public record CopyResponse(

    @Schema(description = "카피 문구", example = "Brand Your Team")
    String content
){

}
