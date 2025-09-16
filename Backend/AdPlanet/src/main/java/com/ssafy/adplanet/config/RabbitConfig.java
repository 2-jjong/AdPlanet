package com.ssafy.adplanet.config;

import lombok.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.amqp.core.Queue;

@Configuration
public class RabbitConfig {

//    @Value("${app.queue.image}")
//    private String imageQueue;
//
//    @Bean
//    public Queue imageQueue() {
//        return new Queue(imageQueue, true); // durable = true
//    }

    @Bean
    public Queue testQueue() {
        // durable=true → 서버 꺼져도 큐 유지
        return new Queue("ham.test.queue", true);
    }
}
