package com.ssafy.adplanet.dto.poster.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "포스터 그룹")
public record PosterGroupResponse(

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "포스터 그룹 id", example = "1")
    Long posterGroupId,

    @Schema(description = "대표 이미지 url", example = "https://...")
    String imgUrl,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "프롬프트", example = "아삭아삭한 배추 이미지, 싱싱한 초록색 활용")
    String prompt,

    @Schema(description = "제목", example = "싸피컴퍼니")
    String title,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "내용", example = "포기는 배추 셀 때나 하는 말")
    String content,

    @Schema(description = "생성 일시", example = "2025-09-13T10:00:00Z")
    LocalDateTime createdAt,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "생성한 포스터 목록")
    List<PosterResponse> history
){
    public PosterGroupResponse(Long posterGroupId, String imgUrl, String title, String content, LocalDateTime createdAt) {
        this(posterGroupId, imgUrl, null, title, content, createdAt, null);
    }

    public PosterGroupResponse(Long posterGroupId, String imgUrl, String title, String content, String prompt, LocalDateTime createdAt) {
        this(posterGroupId, imgUrl, prompt, title, content, createdAt, null);
    }
}
