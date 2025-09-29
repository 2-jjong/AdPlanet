package com.ssafy.adplanet.security;

public record JwtUserPrincipal(Long userId, String email) {
}