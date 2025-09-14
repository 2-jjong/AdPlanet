package com.ssafy.adplanet.service.auth;

import com.ssafy.adplanet.dto.auth.oauth.SSAFYOAuthTokenResponse;
import com.ssafy.adplanet.dto.auth.oauth.SSAFYUserInfoResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Slf4j
@Service
public class SSAFYOAuthServiceImpl implements SSAFYOAuthService {

    private final WebClient ssafyWebClient;
    private final String clientId;
    private final String clientSecret;
    private final String redirectUri;

    public SSAFYOAuthServiceImpl(
            @Qualifier("ssafyWebClient") WebClient ssafyWebClient,
            @Value("${oauth.ssafy.client-id}") String clientId,
            @Value("${oauth.ssafy.client-secret}") String clientSecret,
            @Value("${oauth.ssafy.redirect-uri}") String redirectUri) {
        this.ssafyWebClient = ssafyWebClient;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.redirectUri = redirectUri;
    }

    @Override
    public SSAFYOAuthTokenResponse getOAuthToken(String authCode) {
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("grant_type", "authorization_code");
        formData.add("client_id", clientId);
        formData.add("client_secret", clientSecret);
        formData.add("redirect_uri", redirectUri);
        formData.add("code", authCode);

        try {
            return ssafyWebClient.post()
                    .uri("/ssafy/oauth2/token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(BodyInserters.fromFormData(formData))
                    .retrieve()
                    .bodyToMono(SSAFYOAuthTokenResponse.class)
                    .block();
        } catch (WebClientResponseException e) {
            log.error("OAuth 토큰 요청 실패: {}", e.getMessage());
            throw new RuntimeException("OAuth 토큰 발급 실패", e);
        }
    }

    @Override
    public SSAFYUserInfoResponse getUserInfo(String accessToken) {
        try {
            return ssafyWebClient.get()
                    .uri("/ssafy/resources/userInfo")
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .bodyToMono(SSAFYUserInfoResponse.class)
                    .block();
        } catch (WebClientResponseException e) {
            log.error("SSAFY 사용자 정보 조회 실패: {}", e.getMessage());
            throw new RuntimeException("사용자 정보 조회 실패", e);
        }
    }
}