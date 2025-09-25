package com.ssafy.adplanet.service.ai;

import com.ssafy.adplanet.dto.logo.LogoGenerateRequest;
import com.ssafy.adplanet.dto.poster.request.GeneratePosterRequest;
import com.ssafy.adplanet.dto.poster.request.ImageJobMessage;

public interface AiService {
    byte[] generateLogo(LogoGenerateRequest req);

    byte[] generatePoster(GeneratePosterRequest request);
}
