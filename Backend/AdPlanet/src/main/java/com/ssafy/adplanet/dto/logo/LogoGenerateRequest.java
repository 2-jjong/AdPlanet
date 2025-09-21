package com.ssafy.adplanet.dto.logo;

import com.ssafy.adplanet.enums.LogoStyle;

public record LogoGenerateRequest(
        String title,
        String content,
        String prompt,
        int width,
        int height,
        LogoStyle style
) { }
