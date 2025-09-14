package com.ssafy.adplanet.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "SSAFY 로그인 응답")
public record SSAFYLoginResponseDto(
        @Schema(description = "HTTP 메소드", example = "GET")
        String httpMethod,

        @Schema(description = "로그인 URL", example = "https://ssafy.com/oauth/authorize?client_id=...")
        String loginUrl
) {
}