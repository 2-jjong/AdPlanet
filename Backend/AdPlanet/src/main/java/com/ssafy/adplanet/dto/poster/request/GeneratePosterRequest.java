package com.ssafy.adplanet.dto.poster.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Builder
@Schema(description = "포스터 생성 값")
public record GeneratePosterRequest(

        @Schema(description = "프롬프트", example = "배추 모티프, 상큼한 초록/민트톤, 미니멀 스타일")
        String prompt,

        @Schema(description = "포즈 이미지", example = "poseImage.png")
        byte[] poseImage,

        @Schema(description = "제품 이미지", example = "productImage.png")
        byte[] productImage,

        @Schema(description = "모델 이미지", example = "modelImage.png")
        byte[] modelImage
) {

}
