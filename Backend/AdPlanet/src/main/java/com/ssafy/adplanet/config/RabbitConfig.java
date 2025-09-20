package com.ssafy.adplanet.config;

import com.ssafy.adplanet.service.poster.MessageListener;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.listener.SimpleMessageListenerContainer;
import org.springframework.amqp.rabbit.listener.adapter.MessageListenerAdapter;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class RabbitConfig {

    @Value("${app.queue.test}")
    private String posterQueue;

    @Bean
    public Queue posterQueue() {
        return new Queue(posterQueue, true, false, false);
    }

    @Bean
    public DirectExchange posterExchange() {
        return new DirectExchange("poster.exchange");
    }

    @Bean
    public Binding binding(Queue posterQueue, DirectExchange posterExchange) {
        return BindingBuilder.bind(posterQueue).to(posterExchange).with("poster.key");
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public AmqpTemplate amqpTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }

    @Bean
    public SimpleMessageListenerContainer container(ConnectionFactory connectionFactory,
                                                    MessageListenerAdapter listenerAdapter) {
        SimpleMessageListenerContainer container = new SimpleMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.setQueueNames(posterQueue);
        container.setMessageListener(listenerAdapter);
        return container;
    }

    @Bean
    public MessageListenerAdapter listenerAdapter(MessageListener consumer, MessageConverter converter) {
        MessageListenerAdapter adapter = new MessageListenerAdapter(consumer, "receiveJob");
        adapter.setMessageConverter(converter); // JSON 변환기 등록
        return adapter;
    }
}
