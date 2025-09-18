package com.ssafy.adplanet.service.poster;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class MessagePublisher {

    private final RabbitTemplate rabbitTemplate;
    private static final Logger log = LoggerFactory.getLogger(MessagePublisher.class);

    @Value("${app.queue.test}")
    private String queue;

    public MessagePublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendMessage(String message) {
        rabbitTemplate.convertAndSend(queue, message);
        log.info(" [x] Sent: " + message);
    }
}
