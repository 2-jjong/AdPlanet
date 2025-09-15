package com.ssafy.adplanet.service.auth;

import com.ssafy.adplanet.dto.auth.LoginTokens;
import com.ssafy.adplanet.dto.auth.oauth.SSAFYOAuthTokenResponse;
import com.ssafy.adplanet.dto.auth.oauth.SSAFYUserInfoResponse;
import com.ssafy.adplanet.entity.User;
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


    @Override
    public LoginTokens login(String authCode) {
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
        String accessToken = jwtUtil.generateAccessToken(user.getUserId());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUserId());

        return new LoginTokens(accessToken, refreshToken);
    }

    @Override
    public LoginTokens loginForTest(String authCode) {
        // SSAFY OAuth 토큰 발급
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
        String accessToken = jwtUtil.generateAccessToken(user.getUserId());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUserId());

        return new LoginTokens(accessToken, refreshToken);
    }
}