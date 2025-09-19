package com.ssafy.adplanet.dto.poster.request;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "포스터 태그 지정")
public record PosterTagRequest (
        @Schema(description = "포스터 그룹 id", example = "1") Long groupId,
        @Schema(description = "태그 id 목록", example = "[1, 2, 3]") List<Long> tagId
){

}