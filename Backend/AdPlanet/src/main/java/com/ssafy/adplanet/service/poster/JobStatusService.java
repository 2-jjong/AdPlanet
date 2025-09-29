package com.ssafy.adplanet.service.poster;

import com.ssafy.adplanet.entity.ImageJob;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

public interface JobStatusService {
    void markProcessing(ImageJob imageJob);
}
