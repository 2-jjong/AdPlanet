package com.ssafy.adplanet.service.ci;

import com.ssafy.adplanet.dto.ci.CiGuidelineResponse;

import java.util.Optional;

public interface CiGuidelineService {
    CiGuidelineResponse createWithImageAi(Long logoId);
    Optional<CiGuidelineResponse> getByLogoId(Long logoId);
}
