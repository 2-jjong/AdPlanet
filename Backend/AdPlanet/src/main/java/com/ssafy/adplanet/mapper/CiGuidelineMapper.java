package com.ssafy.adplanet.mapper;

import com.ssafy.adplanet.dto.ci.CiGuidelineResponse;
import com.ssafy.adplanet.entity.CiGuideline;
import com.ssafy.adplanet.entity.CiGuidelineTemplate;

public final class CiGuidelineMapper {
    private CiGuidelineMapper() {}

    public static CiGuidelineResponse toResponse(CiGuideline e) {
        CiGuidelineTemplate t = e.getTemplate();
        return new CiGuidelineResponse(
                e.getId(),
                e.getLogo().getId(),
                t.getBasicLogoRule(),
                t.getMinSizeRule(),
                t.getMarginRule(),
                t.getBackgroundRule(),
                t.getProhibitionRule(),
                e.getPrimaryColor(),
                e.getSecondaryColor(),
                e.getNeutralColor(),
                e.getPrimaryGuide(),
                e.getSecondaryGuide(),
                e.getNeutralGuide()
        );
    }
}
