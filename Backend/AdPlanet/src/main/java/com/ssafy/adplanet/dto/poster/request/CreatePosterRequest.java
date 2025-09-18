package com.ssafy.adplanet.dto.poster.request;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "포스터 생성 요청")
public record CreatePosterRequest(

        @Schema(description = "포스터 그룹 id", example = "1")
        Long groupId,

        @Schema(description = "제목", example = "싸피컴퍼니")
        String title,

        @Schema(description = "설명", example = "포기는 배추 셀 때나 하는 말")
        String content,

        @Schema(description = "프롬프트", example = "배추 모티프, 상큼한 초록/민트톤, 미니멀 스타일")
        String prompt
) { }
