package com.ssafy.adplanet.service.poster;

import com.ssafy.adplanet.config.RabbitConsumerReadyChecker;
import com.ssafy.adplanet.dto.poster.request.ImageJobMessage;
import com.ssafy.adplanet.exception.BusinessException;
import com.ssafy.adplanet.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class MessagePublisher {

    private final RabbitTemplate rabbitTemplate;
    private final RabbitConsumerReadyChecker readyChecker;

    private static final Logger log = LoggerFactory.getLogger(MessagePublisher.class);

    public void sendJob(ImageJobMessage message) {
        log.info("📤 [MQ-SEND] 이미지 처리 작업 전송: {}", message.jobId());

        try {
            // 잠깐 대기 (Consumer 준비 시간 확보)
            readyChecker.waitUntilReady();

            // 메시지 발송
            rabbitTemplate.convertAndSend("poster.exchange", "poster.key", message);
            log.info("🐰 [MQ-SEND] 메시지 발송 완료: {}", message.jobId());

        } catch (Exception e) {
            log.error("❌ [MQ-SEND] 메시지 발송 실패: {}", message.jobId(), e);
            throw new BusinessException(ErrorCode.POSTER_JOB_QUEUE_FAILED);
        }
    }
}
