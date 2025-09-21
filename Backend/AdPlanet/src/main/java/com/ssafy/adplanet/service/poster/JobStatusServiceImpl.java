package com.ssafy.adplanet.service.poster;

import com.ssafy.adplanet.entity.ImageJob;
import com.ssafy.adplanet.enums.JobStatus;
import com.ssafy.adplanet.repository.ImageJobRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class JobStatusServiceImpl implements JobStatusService {

    private final ImageJobRepository imageJobRepository;

    private static final Logger log = LoggerFactory.getLogger(MessageListener.class);

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void markProcessing(ImageJob imageJob) {
        imageJob.setStatus(JobStatus.PROCESSING);
        imageJob.setUpdatedAt(LocalDateTime.now());
        imageJobRepository.save(imageJob);

        log.info("🔄 [{}] 작업 시작: {}", imageJob.getStatus().name(), imageJob.getId());
    }
}
