package com.ssafy.adplanet.dto.poster.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "포스터")
public record PosterResponse (

    @Schema(description = "포스터 id", example = "1")
    Long posterId,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "포스터 그룹 id", example = "1")
    Long groupId,

    @Schema(description = "이미지 url", example = "https://...")
    String imgUrl,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "프롬프트", example = "아삭아삭한 배추 이미지, 싱싱한 초록색 활용")
    String prompt
){
    public PosterResponse(Long posterId, String imgUrl) {
        this(posterId, null, imgUrl, null);
    }

    public PosterResponse(Long posterId, String imgUrl, String prompt) {
        this(posterId, null, imgUrl, prompt);
    }

    public PosterResponse(Long posterId, Long groupId, String imgUrl) {
        this(posterId, groupId, imgUrl, null);
    }
}
