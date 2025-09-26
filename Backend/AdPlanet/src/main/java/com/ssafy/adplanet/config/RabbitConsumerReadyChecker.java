package com.ssafy.adplanet.config;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.rabbit.listener.MessageListenerContainer;
import org.springframework.amqp.rabbit.listener.RabbitListenerEndpointRegistry;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.Properties;
import java.util.concurrent.TimeUnit;

@Getter
@Slf4j
@Component
@RequiredArgsConstructor
public class RabbitConsumerReadyChecker {

    private volatile boolean ready = false;
    private final RabbitAdmin rabbitAdmin;

    @Qualifier("posterCreateQueue")
    private final Queue posterCreateQueue;

    @Qualifier("posterEditQueue")
    private final Queue posterEditQueue;

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        log.info("🚀 [RABBIT] 애플리케이션 시작 완료");

        // 간단히 3초 대기 (Consumer 등록을 위한 충분한 시간)
        try {
            TimeUnit.SECONDS.sleep(3);
            ready = true;
            log.info("✅ [RABBIT] Consumer 준비 완료 (3초 대기)");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("❌ [RABBIT] 대기 중 인터럽트", e);
        }
    }

    public void waitUntilCreateQueueReady() {

        long start = System.currentTimeMillis();
        while (true) {
            Properties props = rabbitAdmin.getQueueProperties(posterCreateQueue.getName());
            if (props != null && props.get(RabbitAdmin.QUEUE_CONSUMER_COUNT) != null) {
                Integer count = (Integer) props.get(RabbitAdmin.QUEUE_CONSUMER_COUNT);
                if (count > 0) {
                    return; // Consumer 준비 완료
                }
            }
            if (System.currentTimeMillis() - start > 30000) {
                throw new IllegalStateException("Consumer not ready within timeout!");
            }
            try {
                Thread.sleep(200);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Interrupted while waiting for consumer", e);
            }
        }
    }

    public void waitUntilEditQueueReady() {

        long start = System.currentTimeMillis();
        while (true) {
            Properties props = rabbitAdmin.getQueueProperties(posterEditQueue.getName());
            if (props != null && props.get(RabbitAdmin.QUEUE_CONSUMER_COUNT) != null) {
                Integer count = (Integer) props.get(RabbitAdmin.QUEUE_CONSUMER_COUNT);
                if (count > 0) {
                    return; // Consumer 준비 완료
                }
            }
            if (System.currentTimeMillis() - start > 30000) {
                throw new IllegalStateException("Consumer not ready within timeout!");
            }
            try {
                Thread.sleep(200);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Interrupted while waiting for consumer", e);
            }
        }
    }
}