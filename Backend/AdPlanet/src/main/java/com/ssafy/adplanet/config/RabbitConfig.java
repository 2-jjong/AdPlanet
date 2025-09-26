package com.ssafy.adplanet.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.listener.RabbitListenerContainerFactory;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class RabbitConfig {

    @Value("${app.queue.poster.create}")
    private String posterCreateQueue;

    @Value("${app.queue.poster.edit}")
    private String posterEditQueue;

    @Bean
    public Queue posterCreateQueue() {
        return new Queue(posterCreateQueue, true, false, false);
    }

    @Bean
    public Queue posterEditQueue() {
        return new Queue(posterEditQueue, true, false, false);
    }

    @Bean
    public DirectExchange posterExchange() {
        return new DirectExchange("poster.exchange");
    }

    @Bean
    public Binding bindingPosterCreate(Queue posterCreateQueue, DirectExchange posterExchange) {
        return BindingBuilder.bind(posterCreateQueue).to(posterExchange).with("poster.create.key");
    }

    @Bean
    public Binding bindingPosterEdit(Queue posterEditQueue, DirectExchange posterExchange) {
        return BindingBuilder.bind(posterEditQueue).to(posterExchange).with("poster.edit.key");
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }

    @Bean
    public RabbitListenerContainerFactory<?> rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(jsonMessageConverter());
        factory.setAutoStartup(true);
        factory.setConcurrentConsumers(1);
        factory.setMaxConcurrentConsumers(1);

        // 트랜잭션 설정
        factory.setChannelTransacted(false); // 메시지 레벨 트랜잭션 비활성화
        factory.setDefaultRequeueRejected(false);

        // 에러 핸들링
        factory.setErrorHandler(throwable -> {
            log.error("❌ [RABBIT-ERROR] Consumer에서 처리되지 않은 예외:", throwable);
        });

        return factory;
    }

    @Bean
    public RabbitAdmin rabbitAdmin(ConnectionFactory connectionFactory) {
        return new RabbitAdmin(connectionFactory);
    }

}
