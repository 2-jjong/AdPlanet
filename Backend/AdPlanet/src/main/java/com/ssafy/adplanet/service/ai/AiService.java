package com.ssafy.adplanet.service.ai;

import com.ssafy.adplanet.dto.logo.ImageConvertRequest;
import com.ssafy.adplanet.dto.logo.LogoGenerateRequest;
import com.ssafy.adplanet.dto.poster.request.GeneratePosterRequest;

public interface AiService {
    byte[] generateLogo(LogoGenerateRequest req);

    byte[] generatePoster(GeneratePosterRequest request);

    byte[] editPoster(String prompt, byte[] previousImage);
    byte[] convertImage(ImageConvertRequest req);
}
