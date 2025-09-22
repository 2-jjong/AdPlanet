package com.ssafy.adplanet.service.poster;

import com.ssafy.adplanet.dto.poster.request.ImageJobMessage;
import com.ssafy.adplanet.entity.ImageJob;
import com.ssafy.adplanet.entity.Poster;
import com.ssafy.adplanet.entity.PosterGroup;
import com.ssafy.adplanet.entity.User;
import com.ssafy.adplanet.enums.JobStatus;
import com.ssafy.adplanet.repository.ImageJobRepository;
import com.ssafy.adplanet.repository.PosterGroupRepository;
import com.ssafy.adplanet.repository.PosterRepository;
import com.ssafy.adplanet.repository.UserRepository;
import com.ssafy.adplanet.service.s3.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class MessageListener {

    private static final Logger log = LoggerFactory.getLogger(MessageListener.class);

    private final PosterService posterService;

    @RabbitListener(queues = "${app.queue.poster}")
    public void receiveJob(ImageJobMessage message) {
        String jobId = message.jobId();
        log.info("🐰 [MQ-RECEIVE] 새로운 작업: {}", jobId);

        try {
            posterService.processJob(message);
            log.info("🐰 [MQ-RECEIVE] 메시지 처리 완료: {}", jobId);
        } catch (Exception e) {
            log.error("❌ [MQ-RECEIVE] 메시지 처리 중 오류: {}", jobId, e);
        }
    }
}
