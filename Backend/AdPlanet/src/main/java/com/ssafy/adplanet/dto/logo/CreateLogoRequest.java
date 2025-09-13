package com.ssafy.adplanet.dto.logo;

public record CreateLogoRequest(
        String title,
        String content,
        String prompt
) { }
