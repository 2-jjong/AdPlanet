package com.ssafy.adplanet.service.logo;

import com.ssafy.adplanet.dto.logo.CreateLogoRequest;
import com.ssafy.adplanet.dto.logo.LogoDetail;
import com.ssafy.adplanet.dto.logo.LogoDto;
import com.ssafy.adplanet.dto.logo.LogoListItem;
import com.ssafy.adplanet.enums.LogoListOrder;
import com.ssafy.adplanet.enums.LogoStyle;

import java.util.List;

public interface LogoService {
    LogoDto logoCreate(Long userId, CreateLogoRequest req, LogoStyle style) throws Exception;
    List<LogoListItem> logoList(Long userId, List<Long> tagIds, LogoListOrder order);
    LogoDetail logoDetail(Long userId, Long logoId);
}
