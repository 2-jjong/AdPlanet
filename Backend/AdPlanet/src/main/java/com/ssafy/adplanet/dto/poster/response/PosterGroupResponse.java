package com.ssafy.adplanet.dto.poster.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;


public record PosterGroupResponse(

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "포스터 그룹 id", example = "1")
    Long posterGroupId,

    @Schema(description = "대표 이미지 url", example = "https://...")
    String imgUrl,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "프롬프트", example = "아삭아삭한 배추 이미지, 싱싱한 초록색 활용")
    String prompt,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "생성 일시", example = "2025-09-13T10:00:00Z")
    LocalDateTime createdAt,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "생성한 포스터 목록")
    List<PosterResponse> history
){
    public PosterGroupResponse(String imgUrl, String prompt, List<PosterResponse> history) {
        this(null, imgUrl, prompt, null, history);
    }

    public PosterGroupResponse(Long posterGroupId, String imgUrl, LocalDateTime createdAt) {
        this(posterGroupId, imgUrl, null, createdAt, null);
    }
}
