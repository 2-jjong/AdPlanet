package com.ssafy.adplanet.service.ai;

import com.ssafy.adplanet.dto.logo.ImageConvertRequest;
import com.ssafy.adplanet.dto.logo.LogoGenerateRequest;

public interface AiService {
    byte[] generateLogo(LogoGenerateRequest req);
    byte[] convertImage(ImageConvertRequest req);
}
