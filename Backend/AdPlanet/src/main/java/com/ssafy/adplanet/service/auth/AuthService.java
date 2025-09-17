package com.ssafy.adplanet.service.auth;

import com.ssafy.adplanet.dto.auth.LoginTokens;

public interface AuthService {
    LoginTokens login(String authCode);
    LoginTokens loginForTest(String authCode);
    LoginTokens reissueTokens(String refreshToken);
    void logout(Long userId);
}