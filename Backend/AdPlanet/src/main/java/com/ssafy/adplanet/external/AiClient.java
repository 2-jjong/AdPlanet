package com.ssafy.adplanet.external;

import com.ssafy.adplanet.dto.logo.LogoGenerateRequest;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class AiClient {

    private final AiHttp http;

    public byte[] generateLogo(LogoGenerateRequest req) {
        return http.postForImage("/api/logo/generate", req);
    }

    /** 추후 포스터 연결시 사용 */
//    public byte[] generatePoster(PosterGenReq req) {
//        return http.postForImage("/api/poster/generate", req);
//    }
}
