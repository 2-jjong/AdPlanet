package com.ssafy.adplanet.service.poster;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class MessageListener {

    private static final Logger log = LoggerFactory.getLogger(MessageListener.class);

    @RabbitListener(queues = "${app.queue.test}")
    public void receiveMessage(String message) {
        log.info(" [x] Received: " + message);
    }
}
