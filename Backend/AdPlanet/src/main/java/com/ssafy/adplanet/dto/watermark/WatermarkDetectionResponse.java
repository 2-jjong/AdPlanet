package com.ssafy.adplanet.dto.watermark;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "워터마크 검출 응답")
public record WatermarkDetectionResponse(
        @Schema(description = "워터마크 검출 여부", example = "true")
        boolean isDetected,

        @Schema(description = "워터마크 제작자", example = "이종현")
        @JsonInclude(JsonInclude.Include.NON_NULL)
        String creator,

        @Schema(description = "워터마크 내용", example = "AdPlanet 워터마크")
        @JsonInclude(JsonInclude.Include.NON_NULL)
        String content
) {
}