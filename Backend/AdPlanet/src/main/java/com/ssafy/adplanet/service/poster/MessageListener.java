package com.ssafy.adplanet.service.poster;

import com.ssafy.adplanet.dto.poster.request.EditPosterJobMessage;
import com.ssafy.adplanet.dto.poster.request.CreatePosterJobMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class MessageListener {

    private static final Logger log = LoggerFactory.getLogger(MessageListener.class);

    private final PosterService posterService;

    @RabbitListener(queues = "${app.queue.poster.create}")
    public void receiveCreateJob(CreatePosterJobMessage message) {
        String jobId = message.jobId();
        log.info("🐰 [MQ-RECEIVE] 새로운 포스터 생성 작업: {}", jobId);

        try {
            posterService.processCreateJob(message);
            log.info("🐰 [MQ-RECEIVE] 메시지 처리 완료: {}", jobId);
        } catch (Exception e) {
            log.error("❌ [MQ-RECEIVE] 메시지 처리 중 오류: {}", jobId, e);
        }
    }

    @RabbitListener(queues = "${app.queue.poster.edit}")
    public void receiveEditJob(EditPosterJobMessage message) {
        String jobId = message.jobId();
        log.info("🐰 [MQ-RECEIVE] 새로운 포스터 수정 작업: {}", jobId);

        try {
            posterService.processEditJob(message);
            log.info("🐰 [MQ-RECEIVE] 메시지 처리 완료: {}", jobId);
        } catch (Exception e) {
            log.error("❌ [MQ-RECEIVE] 메시지 처리 중 오류: {}", jobId, e);
        }
    }
}
