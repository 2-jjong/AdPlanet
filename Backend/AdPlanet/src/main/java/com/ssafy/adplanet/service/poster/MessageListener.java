package com.ssafy.adplanet.service.poster;

import com.ssafy.adplanet.dto.poster.request.ImageJobMessage;
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

    private final S3Service s3Service;
    private final ImageJobRepository imageJobRepository;
    private final PosterGroupRepository posterGroupRepository;
    private final PosterRepository posterRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    private String workerServerUrl = "";

    private static final int MAX_RETRY = 3;

    @Transactional
    @RabbitListener(queues = "${app.queue.test}")
    public void receiveJob(ImageJobMessage message) {

        log.info("\uD83D\uDC30 [MQ-RECEIVE] 새로운 작업: " + message.jobId());

        imageJobRepository.findById(message.jobId()).ifPresent(imageJob -> {

            log.info("DB 존재: " + message.jobId());

            // 상태 체크: 이미 처리중이면 무시
            if (imageJob.getStatus() != JobStatus.QUEUED) return;

            // 상태 업데이트
            imageJob.setStatus(JobStatus.PROCESSING);
            imageJob.setUpdatedAt(LocalDateTime.now());
            imageJobRepository.save(imageJob);

            // 파이썬 서버 호출 + 재시도 로직
            boolean success = false;
            for (int i = 0; i < MAX_RETRY; i++) {
                try {

                    // 1. 생성 요청 값 확인
                    // request 따라 모델 분기 처리 필요

                    // 1. S3에서 파일 다운로드 (존재할 경우만)
                    MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

                    if (message.sketchKey() != null) {
                        File sketchFile = s3Service.downloadFile(message.sketchKey());
                        body.add("sketchImage", new FileSystemResource(sketchFile));
                        log.info("sketchFile: " + sketchFile.getName());
                    }
                    if (message.productKey() != null) {
                        File productFile = s3Service.downloadFile(message.productKey());
                        body.add("productImage", new FileSystemResource(productFile));
                        log.info("productFile: " + productFile.getName());
                    }
                    if (message.modelKey() != null) {
                        File modelFile = s3Service.downloadFile(message.modelKey());
                        body.add("modelImage", new FileSystemResource(modelFile));
                        log.info("modelFile: " + modelFile.getName());
                    }
                    if (message.skeletonKey() != null) {
                        File skeletonFile = s3Service.downloadFile(message.skeletonKey());
                        body.add("skeletonImage", new FileSystemResource(skeletonFile));
                        log.info("skeletonFile: " + skeletonFile.getName());
                    }
                    if (message.previousKey() != null) {
                        File previousFile = s3Service.downloadFile(message.previousKey());
                        body.add("previousImage", new FileSystemResource(previousFile));
                        log.info("previousFile: " + previousFile.getName());
                    }

                    // 추가적인 텍스트 파라미터
                    body.add("prompt", message.prompt());

                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.MULTIPART_FORM_DATA);

                    HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);

                    // 2. Python 서버 호출 (추후 수정: 실제 url)
//                    ResponseEntity<String> response = restTemplate.postForEntity(workerServerUrl, request, String.class);

//                    if (response.getStatusCode().is2xxSuccessful()) {
                    if (true) {

                        // COMPLETED: GENERATION SUCCESS

                        // DB에 결과 반영
                        imageJob.setStatus(JobStatus.COMPLETED);
                        imageJob.setUpdatedAt(LocalDateTime.now());
                        imageJobRepository.save(imageJob);
                        success = true;

                        // PosterGroup 생성 or 조회
                        User userRef = userRepository.getReferenceById(message.userId());

                        PosterGroup posterGroup;
                        if (message.groupId() != null) {
                            posterGroup = posterGroupRepository.getReferenceById(message.groupId());
                        } else {
                            posterGroup = PosterGroup.builder()
                                    .user(userRef)
                                    .title(message.title())
                                    .content(message.content())
                                    .createdAt(LocalDateTime.now())
                                    .build();
                            posterGroupRepository.saveAndFlush(posterGroup);
                        }

                        // 1) DB 선저장 (키 생성용 ID 필요)
                        Poster poster = Poster.builder()
                                .posterGroup(posterGroup)
                                .prompt(message.prompt())
                                .imgUrl("s3:pending")
                                .createdAt(LocalDateTime.now())
                                .build();
                        posterRepository.saveAndFlush(poster);

                        // 2) 이미지 생성 (추후 수정: 더미 이미지 -> 생성형 AI 결과물 사용)
                        byte[] imageBytes = generateDummyPng(message.title(), message.prompt());

                        // 3) S3 업로드 + URI 저장
                        String key = s3Service.buildKey("poster_" + poster.getId() + ".png");
                        s3Service.upload(key, imageBytes, "image/png");
                        poster.setImgUrl(s3Service.toS3Uri(key));

                        // 4) 대표 포스터 변경
                        posterGroup.setMainPoster(poster);
                        imageJob.setResultPoster(poster);

                        break;
                    }
                } catch (Exception e) {
                    // 실패 시 로그, 잠시 대기 후 재시도
                    try { Thread.sleep(2000); } catch (InterruptedException ignored) {}
                }
            }

            // FAILED: TIMEOUT
            if (!success) {
                imageJob.setStatus(JobStatus.FAILED);
                imageJob.setUpdatedAt(LocalDateTime.now());
                imageJobRepository.save(imageJob);
            }
        });
    }

    // --- 더미 이미지 생성 코드 ---
    private static byte[] generateDummyPng(String title, String slogan) {
        try {
            int W = 512, H = 512;
            BufferedImage img = new BufferedImage(W, H, BufferedImage.TYPE_INT_ARGB);
            Graphics2D g = img.createGraphics();
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

            g.setColor(new Color(0xF2F7FA)); g.fillRect(0,0,W,H);
            g.setColor(new Color(0x46A9DB)); g.fillOval(W/2-120, H/2-120, 240, 240);
            g.setColor(new Color(0x193747));

            g.setFont(new Font("SansSerif", Font.BOLD, 28));
            drawCentered(g, (title == null ? "" : title), W/2, H/2+10);

            g.setFont(new Font("SansSerif", Font.PLAIN, 16));
            drawCentered(g, (slogan == null ? "" : slogan), W/2, H/2+40);

            g.dispose();
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(img, "png", baos);
            return baos.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("더미 이미지 생성 실패: " + e.getMessage(), e);
        }
    }

    private static void drawCentered(Graphics2D g, String text, int cx, int cy) {
        if (text == null || text.isBlank()) return;
        var fm = g.getFontMetrics();
        int x = cx - fm.stringWidth(text)/2;
        int y = cy - fm.getHeight()/2 + fm.getAscent();
        g.drawString(text, x, y);
    }
}
