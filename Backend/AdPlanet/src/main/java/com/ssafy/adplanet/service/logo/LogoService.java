package com.ssafy.adplanet.service.logo;

import com.ssafy.adplanet.dto.logo.CreateLogoRequest;
import com.ssafy.adplanet.dto.logo.LogoDto;

public interface LogoService {
    LogoDto create(Long userId, CreateLogoRequest req);
}
