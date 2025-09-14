package com.ssafy.adplanet.dto.auth.oauth;

import com.fasterxml.jackson.annotation.JsonProperty;

public record SSAFYOAuthTokenResponse(
        @JsonProperty("token_type")
        String tokenType,

        @JsonProperty("access_token")
        String accessToken,

        String scope,

        @JsonProperty("expires_in")
        String expiresIn,

        @JsonProperty("refresh_token")
        String refreshToken,

        @JsonProperty("refresh_token_expires_in")
        Integer refreshTokenExpiresIn
) {
}