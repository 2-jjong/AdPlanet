package com.ssafy.adplanet.service.poster;

import com.ssafy.adplanet.entity.ImageJob;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

public interface JobStatusService {
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    void markProcessing(ImageJob imageJob);
}
