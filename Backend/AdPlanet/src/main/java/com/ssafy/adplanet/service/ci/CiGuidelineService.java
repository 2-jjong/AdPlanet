package com.ssafy.adplanet.service.ci;

import com.ssafy.adplanet.dto.ci.CiGuidelineResponse;

public interface CiGuidelineService {
    CiGuidelineResponse createWithImageAi(Long logoId);
}
