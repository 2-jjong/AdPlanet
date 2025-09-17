package com.ssafy.adplanet.service.auth;

import com.ssafy.adplanet.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final JwtUtil jwtUtil;

    @Value("${jwt.refresh-token.expiration}")
    private long refreshTokenExpiration;

    private static final String REFRESH_TOKEN_PREFIX = "refresh_token:";

    @Override
    public void saveRefreshToken(Long userId, String refreshToken) {
        String key = REFRESH_TOKEN_PREFIX + userId;
        Duration expiration = Duration.ofMillis(refreshTokenExpiration);

        redisTemplate.opsForValue().set(key, refreshToken, expiration);
        log.info("RefreshToken 저장 완료 - UserId: {}, TTL: {}ms", userId, refreshTokenExpiration);
    }

    @Override
    public String getRefreshToken(Long userId) {
        String key = REFRESH_TOKEN_PREFIX + userId;
        Object token = redisTemplate.opsForValue().get(key);

        if (token != null) {
            log.debug("RefreshToken 조회 성공 - UserId: {}", userId);
            return token.toString();
        }

        log.debug("RefreshToken 조회 실패 - UserId: {}", userId);
        return null;
    }

    @Override
    public boolean isValidRefreshToken(Long userId, String refreshToken) {
        try {
            // JWT 서명 및 형식 검증
            if (!jwtUtil.validateToken(refreshToken)) {
                log.debug("RefreshToken 검증 실패 - JWT 서명/형식 오류 - UserId: {}", userId);
                return false;
            }

            // 만료 검증
            if (jwtUtil.isTokenExpired(refreshToken)) {
                log.debug("RefreshToken 검증 실패 - 토큰 만료 - UserId: {}", userId);
                return false;
            }

            // RefreshToken 타입 검증
            if (!"REFRESH".equals(jwtUtil.getTokenType(refreshToken))) {
                log.debug("RefreshToken 검증 실패 - 토큰 타입 오류 - UserId: {}", userId);
                return false;
            }

            // Redis 저장값과 비교
            String storedToken = getRefreshToken(userId);
            boolean isValid = storedToken != null && storedToken.equals(refreshToken);

            log.debug("RefreshToken 검증 - UserId: {}, Valid: {}", userId, isValid);
            return isValid;

        } catch (Exception e) {
            log.error("RefreshToken 검증 중 오류 발생 - UserId: {}, Error: {}", userId, e.getMessage());
            return false;
        }
    }

    @Override
    public void deleteRefreshToken(Long userId) {
        String key = REFRESH_TOKEN_PREFIX + userId;
        Boolean deleted = redisTemplate.delete(key);

        log.info("RefreshToken 삭제 - UserId: {}, Deleted: {}", userId, deleted);
    }
}