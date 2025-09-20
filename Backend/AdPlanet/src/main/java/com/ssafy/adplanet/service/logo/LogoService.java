package com.ssafy.adplanet.service.logo;

import com.ssafy.adplanet.dto.logo.CreateLogoRequest;
import com.ssafy.adplanet.dto.logo.LogoDetail;
import com.ssafy.adplanet.dto.logo.LogoDto;
import com.ssafy.adplanet.dto.logo.LogoListItem;
import com.ssafy.adplanet.enums.LogoListOrder;
import com.ssafy.adplanet.enums.LogoStyle;

import java.util.List;

public interface LogoService {
    LogoDto create(Long userId, CreateLogoRequest req, LogoStyle style);
    List<LogoListItem> list(Long userId, List<Long> tagIds, LogoListOrder order);
    LogoDetail detail(Long userId, Long logoId);
}
