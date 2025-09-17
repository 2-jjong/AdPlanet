package com.ssafy.adplanet.service.logo;

import com.ssafy.adplanet.dto.logo.CreateLogoRequest;
import com.ssafy.adplanet.dto.logo.LogoDto;
import com.ssafy.adplanet.enums.LogoStyle;

public interface LogoService {
    LogoDto create(Long userId, CreateLogoRequest req, LogoStyle style);
}
