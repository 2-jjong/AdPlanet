package com.ssafy.adplanet.service.auth;

import com.ssafy.adplanet.dto.auth.LoginTokens;

public interface AuthService {
    LoginTokens login(String authCode);
}