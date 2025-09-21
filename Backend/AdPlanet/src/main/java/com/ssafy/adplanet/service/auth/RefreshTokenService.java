package com.ssafy.adplanet.service.auth;

public interface RefreshTokenService {

    void saveRefreshToken(Long userId, String refreshToken);
    void validateRefreshToken(Long userId, String refreshToken);
    void deleteRefreshToken(Long userId);
}