package com.ssafy.adplanet.dto.poster.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;

public record CopyResponse(

    @Schema(description = "카피 문구", example = "Brand Your Team")
    String content
){

}
