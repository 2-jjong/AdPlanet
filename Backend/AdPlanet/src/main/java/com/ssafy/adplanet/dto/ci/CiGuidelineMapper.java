package com.ssafy.adplanet.dto.ci;

import com.ssafy.adplanet.entity.CiGuideline;

public final class CiGuidelineMapper {
    private CiGuidelineMapper() {}

    public static CiGuidelineResponse toResponse(CiGuideline e) {
        return new CiGuidelineResponse(
                e.getId(),
                e.getLogo().getId(),
                e.getBasicLogoRule(),
                e.getMinSizeRule(),
                e.getMarginRule(),
                e.getBackgroundRule(),
                e.getProhibitionRule(),
                e.getPrimaryColor(),
                e.getSecondaryColor(),
                e.getNeutralColor(),
                e.getPrimaryGuide(),
                e.getSecondaryGuide(),
                e.getNeutralGuide()
        );
    }
}
