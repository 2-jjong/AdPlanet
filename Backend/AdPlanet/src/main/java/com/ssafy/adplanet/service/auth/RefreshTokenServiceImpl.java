package com.ssafy.adplanet.service.auth;

import com.ssafy.adplanet.exception.BusinessException;
import com.ssafy.adplanet.exception.ErrorCode;
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
        try {
            String key = REFRESH_TOKEN_PREFIX + userId;
            Duration expiration = Duration.ofMillis(refreshTokenExpiration);

            redisTemplate.opsForValue().set(key, refreshToken, expiration);
            log.info("RefreshToken 저장 완료 - UserId: {}, TTL: {}ms", userId, refreshTokenExpiration);

        } catch (Exception e) {
            log.error("RefreshToken 저장 실패 - UserId: {}, Error: {}", userId, e.getMessage());
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, e);
        }
    }

    private String getRefreshToken(Long userId) {
        try {
            String key = REFRESH_TOKEN_PREFIX + userId;
            Object token = redisTemplate.opsForValue().get(key);

            if (token != null) {
                log.debug("RefreshToken 조회 성공 - UserId: {}", userId);
                return token.toString();
            }

            log.debug("RefreshToken 조회 실패 - UserId: {}", userId);
            return null;

        } catch (Exception e) {
            log.error("RefreshToken 조회 시스템 오류 - UserId: {}, Error: {}", userId, e.getMessage());
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, e);
        }
    }

    @Override
    public void validateRefreshToken(Long userId, String refreshToken) {
        try {
            // JWT 서명 및 형식 검증
            if (!jwtUtil.validateToken(refreshToken)) {
                log.debug("RefreshToken 검증 실패 - JWT 서명/형식 오류 - UserId: {}", userId);
                throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN);
            }

            // 만료 검증
            if (jwtUtil.isTokenExpired(refreshToken)) {
                log.debug("RefreshToken 검증 실패 - 토큰 만료 - UserId: {}", userId);
                throw new BusinessException(ErrorCode.EXPIRED_REFRESH_TOKEN);
            }

            // RefreshToken 타입 검증
            if (!"REFRESH".equals(jwtUtil.getTokenTypeFromToken(refreshToken))) {
                log.debug("RefreshToken 검증 실패 - 토큰 타입 오류 - UserId: {}", userId);
                throw new BusinessException(ErrorCode.INVALID_TOKEN_TYPE);
            }

            // Redis 저장값과 비교
            String storedToken = getRefreshToken(userId);
            if (storedToken == null || !storedToken.equals(refreshToken)) {
                log.debug("RefreshToken 검증 실패 - Redis 토큰 불일치 - UserId: {}", userId);
                throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN);
            }

            log.debug("RefreshToken 검증 성공 - UserId: {}", userId);

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("RefreshToken 검증 중 시스템 오류 - UserId: {}, Error: {}", userId, e.getMessage());
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, e);
        }
    }

    @Override
    public void deleteRefreshToken(Long userId) {
        try {
            String key = REFRESH_TOKEN_PREFIX + userId;
            Boolean deleted = redisTemplate.delete(key);

            log.info("RefreshToken 삭제 - UserId: {}, Deleted: {}", userId, deleted);

        } catch (Exception e) {
            log.error("RefreshToken 삭제 실패 - UserId: {}, Error: {}", userId, e.getMessage());
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, e);
        }
    }
}