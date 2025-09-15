package com.ssafy.adplanet.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "로그인 요청")
public record LoginRequest(
        @Schema(description = "SSAFY 로그인 인가 코드", example = "abc123def456")
        String code
) {
}