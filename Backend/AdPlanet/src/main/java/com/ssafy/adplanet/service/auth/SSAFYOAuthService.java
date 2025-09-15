package com.ssafy.adplanet.service.auth;

import com.ssafy.adplanet.dto.auth.oauth.SSAFYOAuthTokenResponse;
import com.ssafy.adplanet.dto.auth.oauth.SSAFYUserInfoResponse;

public interface SSAFYOAuthService {
    SSAFYOAuthTokenResponse getOAuthToken(String authCode);
    SSAFYOAuthTokenResponse getOAuthTokenForTest(String authCode);
    SSAFYUserInfoResponse getUserInfo(String accessToken);
}