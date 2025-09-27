package com.ssafy.adplanet.dto.logo;

import com.ssafy.adplanet.enums.ImageFormat;

public record ImageConvertRequest(
        ImageFormat targetFormat,
        Integer quality,        // 0~100, null이면 서버 기본(예: 95)
        String filename,        // 멀티파트 필드명용 파일명 (예: logo_123.png)
        byte[] fileBytes        // 원본 PNG 바이트
) {}