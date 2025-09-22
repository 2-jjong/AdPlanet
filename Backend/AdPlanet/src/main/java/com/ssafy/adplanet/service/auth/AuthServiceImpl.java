package com.ssafy.adplanet.service.auth;

import com.ssafy.adplanet.dto.auth.LoginTokens;
import com.ssafy.adplanet.dto.auth.oauth.SSAFYOAuthTokenResponse;
import com.ssafy.adplanet.dto.auth.oauth.SSAFYUserInfoResponse;
import com.ssafy.adplanet.entity.User;
import com.ssafy.adplanet.exception.BusinessException;
import com.ssafy.adplanet.exception.ErrorCode;
import com.ssafy.adplanet.repository.UserRepository;
import com.ssafy.adplanet.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final SSAFYOAuthService ssafyOAuthService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;

    @Override
    public LoginTokens login(String authCode) {
        try {
            // SSAFY OAuth 토큰 발급
            SSAFYOAuthTokenResponse oauthToken = ssafyOAuthService.getOAuthToken(authCode);

            // SSAFY 사용자 정보 조회
            SSAFYUserInfoResponse userInfo = ssafyOAuthService.getUserInfo(oauthToken.accessToken());

            // 이메일로 사용자 조회 또는 신규 등록
            User user = userRepository.findByEmail(userInfo.email())
                    .orElseGet(() -> {
                        log.info("새로운 사용자 등록: {}", userInfo.email());
                        User newUser = User.builder()
                                .name(userInfo.name())
                                .email(userInfo.email())
                                .build();
                        return userRepository.save(newUser);
                    });

            // JWT 토큰 생성
            String accessToken = jwtUtil.generateAccessToken(user.getUserId(), user.getEmail());
            String refreshToken = jwtUtil.generateRefreshToken(user.getUserId(), user.getEmail());

            // RefreshToken을 Redis에 저장
            refreshTokenService.saveRefreshToken(user.getUserId(), refreshToken);

            return new LoginTokens(accessToken, refreshToken);

        } catch (BusinessException e) {
            log.error("로그인 실패: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("로그인 시스템 오류: {}", e.getMessage());
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, e);
        }
    }

    @Override
    public LoginTokens loginForTest(String authCode) {
        try {
            // SSAFY OAuth 토큰 발급 (여러 redirect URI 자동 시도)
            SSAFYOAuthTokenResponse oauthToken = ssafyOAuthService.getOAuthTokenForTest(authCode);

            // SSAFY 사용자 정보 조회
            SSAFYUserInfoResponse userInfo = ssafyOAuthService.getUserInfo(oauthToken.accessToken());

            // 이메일로 사용자 조회 또는 신규 등록
            User user = userRepository.findByEmail(userInfo.email())
                    .orElseGet(() -> {
                        log.info("새로운 사용자 등록: {}", userInfo.email());
                        User newUser = User.builder()
                                .name(userInfo.name())
                                .email(userInfo.email())
                                .build();
                        return userRepository.save(newUser);
                    });

            // JWT 토큰 생성
            String accessToken = jwtUtil.generateAccessToken(user.getUserId(), user.getEmail());
            String refreshToken = jwtUtil.generateRefreshToken(user.getUserId(), user.getEmail());

            // RefreshToken을 Redis에 저장
            refreshTokenService.saveRefreshToken(user.getUserId(), refreshToken);

            return new LoginTokens(accessToken, refreshToken);

        } catch (BusinessException e) {
            log.error("로그인 실패 (테스트): {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("로그인 시스템 오류 (테스트): {}", e.getMessage());
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, e);
        }
    }

    @Override
    public LoginTokens reissueTokens(String refreshToken) {
        try {
            // RefreshToken에서 userId 추출 (기본 파싱만)
            Long userId = jwtUtil.getUserIdFromToken(refreshToken);

            // RefreshToken 유효성 검증
            refreshTokenService.validateRefreshToken(userId, refreshToken);

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

            // 새로운 토큰 생성
            String newAccessToken = jwtUtil.generateAccessToken(userId, user.getEmail());
            String newRefreshToken = jwtUtil.generateRefreshToken(userId, user.getEmail());

            // 새로운 RefreshToken을 Redis에 저장
            refreshTokenService.saveRefreshToken(userId, newRefreshToken);

            return new LoginTokens(newAccessToken, newRefreshToken);

        } catch (BusinessException e) {
            log.error("토큰 갱신 실패: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("토큰 갱신 시스템 오류: {}", e.getMessage());
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, e);
        }
    }

    @Override
    public void logout(Long userId) {
        try {
            // Redis에서 RefreshToken 삭제
            refreshTokenService.deleteRefreshToken(userId);

            log.info("로그아웃 완료 - UserId: {}", userId);

        } catch (Exception e) {
            log.error("로그아웃 시스템 오류 - UserId: {}, Error: {}", userId, e.getMessage());
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, e);
        }
    }
}