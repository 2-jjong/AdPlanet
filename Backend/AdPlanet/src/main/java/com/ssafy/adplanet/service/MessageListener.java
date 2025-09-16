package com.ssafy.adplanet.service;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
public class MessageListener {

    @RabbitListener(queues = "ham.test.queue")
    public void receiveMessage(String message) {
        System.out.println(" [x] Received: " + message);
    }
}
