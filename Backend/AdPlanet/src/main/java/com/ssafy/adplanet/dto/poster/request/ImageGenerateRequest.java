package com.ssafy.adplanet.dto.poster.request;

import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.web.multipart.MultipartFile;

@Schema(description = "포스터 생성 값")
public record ImageGenerateRequest(

        @Schema(description = "프롬프트", example = "배추 모티프, 상큼한 초록/민트톤, 미니멀 스타일")
        String prompt,

        @Schema(description = "스케치 이미지", example = "sketchImage.png")
        MultipartFile sketchImage,

        @Schema(description = "제품 이미지", example = "productImage.png")
        MultipartFile productImage,

        @Schema(description = "모델 이미지", example = "modelImage.png")
        MultipartFile modelImage,

        @Schema(description = "구도 이미지", example = "skeletonImage.png")
        MultipartFile skeletonImage,

        @Schema(description = "이전 이미지", example = "previousImage.png")
        MultipartFile previousImage
) {
        public ImageGenerateRequest() {
                this(null, null, null, null, null, null);
        }
}
