package com.ssafy.adplanet.service.poster;

import com.ssafy.adplanet.config.RabbitConsumerReadyChecker;
import com.ssafy.adplanet.dto.poster.request.EditPosterJobMessage;
import com.ssafy.adplanet.dto.poster.request.CreatePosterJobMessage;
import com.ssafy.adplanet.exception.BusinessException;
import com.ssafy.adplanet.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class MessagePublisher {

    private final RabbitTemplate rabbitTemplate;
    private final RabbitConsumerReadyChecker readyChecker;

    private static final Logger log = LoggerFactory.getLogger(MessagePublisher.class);

    @Value("${app.exchange.poster}")
    private String posterExchange;

    @Value("${app.server-id}")
    private String serverId;

    public void sendCreateJob(CreatePosterJobMessage message) {
        log.info("📤 [MQ-SEND] 포스터 생성 작업 전송: {}", message.jobId());

        try {
            // 잠깐 대기 (Consumer 준비 시간 확보)
            readyChecker.waitUntilCreateQueueReady();

            // 메시지 발송
            String routingKey = "poster.create." + serverId;
            rabbitTemplate.convertAndSend(posterExchange, routingKey, message);
            log.info("🐰 [MQ-SEND] 메시지 발송 완료: {}", message.jobId());

        } catch (Exception e) {
            log.error("❌ [MQ-SEND] 메시지 발송 실패: {}", message.jobId(), e);
            throw new BusinessException(ErrorCode.POSTER_JOB_QUEUE_FAILED);
        }
    }

    public void sendEditJob(EditPosterJobMessage message) {
        log.info("📤 [MQ-SEND] 포스터 수정 작업 전송: {}", message.jobId());

        try {
            // 잠깐 대기 (Consumer 준비 시간 확보)
            readyChecker.waitUntilEditQueueReady();

            // 메시지 발송
            String routingKey = "poster.edit." + serverId;
            rabbitTemplate.convertAndSend(posterExchange, routingKey, message);
            log.info("🐰 [MQ-SEND] 메시지 발송 완료: {}", message.jobId());

        } catch (Exception e) {
            log.error("❌ [MQ-SEND] 메시지 발송 실패: {}", message.jobId(), e);
            throw new BusinessException(ErrorCode.POSTER_JOB_QUEUE_FAILED);
        }
    }
}
