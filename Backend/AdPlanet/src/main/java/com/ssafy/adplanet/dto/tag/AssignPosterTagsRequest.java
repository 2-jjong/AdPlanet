package com.ssafy.adplanet.dto.tag;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

import java.util.List;

@Schema(description = "포스터에 부여할 태그 ID 목록")
public record AssignPosterTagsRequest(
        @NotNull @Schema(description = "태그 id 목록", example = "[1, 2, 3]") List<Long> tagIds
){

}