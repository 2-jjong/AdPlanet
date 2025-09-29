package com.ssafy.adplanet.dto.auth.oauth;

public record SSAFYUserInfoResponse(
        String userid,
        String email,
        String name
) {
}