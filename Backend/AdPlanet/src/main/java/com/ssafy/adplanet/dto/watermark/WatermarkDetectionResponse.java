package com.ssafy.adplanet.dto.watermark;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "워터마크 검출 응답")
public record WatermarkDetectionResponse(
        @Schema(description = "워터마크 제작자", example = "허지명")
        String creator,

        @Schema(description = "워터마크 내용", example = "AdPlanet 워터마크")
        String content
) {
}