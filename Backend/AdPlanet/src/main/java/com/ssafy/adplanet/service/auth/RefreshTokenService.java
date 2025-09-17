package com.ssafy.adplanet.service.auth;

public interface RefreshTokenService {

    void saveRefreshToken(Long userId, String refreshToken);

    String getRefreshToken(Long userId);

    boolean isValidRefreshToken(Long userId, String refreshToken);

    void deleteRefreshToken(Long userId);
}