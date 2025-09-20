package com.ssafy.adplanet.dto.logo;

import com.ssafy.adplanet.dto.tag.TagDto;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "로고 목록 아이템")
public record LogoListItem(
        @Schema(description = "로고 id", example = "1")
        Long logoId,

        @Schema(description = "제목", example = "싸피컴퍼니")
        String name,

        @Schema(description = "설명(슬로건)", example = "포기는 배추 셀 때나 하는 말")
        String slogan,

        @Schema(description = "이미지 URL", example = "/images/logo_1")
        String imgUrl,

        @Schema(description = "태그 목록")
        List<TagDto> tags
) {}
