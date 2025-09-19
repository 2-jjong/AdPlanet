package com.ssafy.adplanet.service.poster;

import com.ssafy.adplanet.dto.poster.request.ImageJobMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class MessagePublisher {

    private final RabbitTemplate rabbitTemplate;
    private static final Logger log = LoggerFactory.getLogger(MessagePublisher.class);

    @Value("${app.queue.test}")
    private String queue;

    public void sendJob(ImageJobMessage job) {
        rabbitTemplate.convertAndSend(queue, job);
        log.info("\uD83D\uDC30 [MQ-SEND] 새로운 작업: " + job.jobId());
    }
}
