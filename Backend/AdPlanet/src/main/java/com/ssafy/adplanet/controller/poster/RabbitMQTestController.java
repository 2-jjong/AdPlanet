package com.ssafy.adplanet.controller.poster;

import com.ssafy.adplanet.service.poster.MessagePublisher;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RabbitMQTestController {

    private final MessagePublisher publisher;

    public RabbitMQTestController(MessagePublisher publisher) {
        this.publisher = publisher;
    }

    @GetMapping("/api/test/rabbit")
    public String testRabbit() {
        publisher.sendMessage("햄 만세!!!🔥🐇");
        return "메시지 전송 완료!";
    }
}
