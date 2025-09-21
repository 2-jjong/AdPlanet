package com.ssafy.adplanet.service.poster;

import com.ssafy.adplanet.dto.poster.request.CreatePosterRequest;
import com.ssafy.adplanet.dto.poster.request.ImageJobMessage;
import com.ssafy.adplanet.dto.poster.response.ImageJobResponse;
import com.ssafy.adplanet.dto.poster.response.PosterResponse;
import com.ssafy.adplanet.entity.ImageJob;
import com.ssafy.adplanet.entity.Poster;
import com.ssafy.adplanet.entity.PosterGroup;
import com.ssafy.adplanet.entity.User;
import com.ssafy.adplanet.enums.JobStatus;
import com.ssafy.adplanet.enums.PosterStyle;
import com.ssafy.adplanet.repository.ImageJobRepository;
import com.ssafy.adplanet.repository.PosterGroupRepository;
import com.ssafy.adplanet.repository.PosterRepository;
import com.ssafy.adplanet.repository.UserRepository;
import com.ssafy.adplanet.service.gms.GmsService;
import com.ssafy.adplanet.service.s3.S3Service;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PosterServiceImpl implements PosterService {

    private static final Logger log = LoggerFactory.getLogger(MessageListener.class);

    private final S3Service s3Service;
    private final GmsService gmsService;
    private final JobStatusService jobStatusService;
    private final UserRepository userRepository;
    private final PosterGroupRepository posterGroupRepository;
    private final PosterRepository posterRepository;
    private final ImageJobRepository imageJobRepository;
    private final MessagePublisher messagePublisher;

    private static final int MAX_RETRY = 10;

    @Override
    public ImageJobResponse create(Long userId, PosterStyle style, CreatePosterRequest request, MultipartFile sketchImage, MultipartFile productImage, MultipartFile modelImage, MultipartFile skeletonImage, MultipartFile previousImage) {

        String jobId = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now();

        // 1. 시나리오 별로 요청값 검증

        // 2. 이미지 S3 저장 & Key 발급
        String sketchKey = uploadIfExists(sketchImage, "sketch", jobId);
        String productKey = uploadIfExists(productImage, "product", jobId);
        String modelKey = uploadIfExists(modelImage, "model", jobId);
        String skeletonKey = uploadIfExists(skeletonImage, "skeleton", jobId);
        String previousKey = uploadIfExists(previousImage, "previous", jobId);

        // 3. DB 저장
        ImageJob job = ImageJob.builder()
                .id(jobId)
                .status(JobStatus.QUEUED)
                .createdAt(now)
                .updatedAt(now)
                .build();
        imageJobRepository.save(job);

        // 4. MQ 발행
        ImageJobMessage message = new ImageJobMessage(
                jobId,
                userId,
                JobStatus.QUEUED,
                now,
                now,
                request.groupId(),
                request.title(),
                request.content(),
                request.prompt(),
                sketchKey,
                productKey,
                modelKey,
                skeletonKey,
                previousKey
        );
        messagePublisher.sendJob(message);

        // 5. DTO 변환 및 반환
        return new ImageJobResponse(
                jobId,
                JobStatus.QUEUED,
                message.createdAt()
        );
    }

    private String uploadIfExists(MultipartFile multipartFile, String prefix, String jobId) {

        if (multipartFile == null || multipartFile.isEmpty()) return null;

        String key = s3Service.buildKey(prefix + "_" + jobId + ".png");

        try (InputStream inputStream = multipartFile.getInputStream()) {
            s3Service.upload(key, inputStream, "image/png");
        } catch (IOException e) {
            throw new RuntimeException("파일 업로드 실패", e);
        }

        return key;
    }

    @Override
    @Transactional
    public void processJob(ImageJobMessage message) throws Exception {

        String jobId = message.jobId();

        // 1. 작업 조회
        ImageJob imageJob = imageJobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found: " + jobId));

        log.info("[POSTER-GEN] DB 조회 성공: {})", jobId);

        // 2. 상태 체크: 이미 처리중이면 무시
        if (imageJob.getStatus() != JobStatus.QUEUED) {
            log.warn("[POSTER-GEN] 이미 처리 중인 작업: {} (현재 상태: {})", jobId, imageJob.getStatus().name());
            return;
        }

        // 3. 상태 업데이트: PROCESSING
        jobStatusService.markProcessing(imageJob);

        // 4. 상태 변경 확인을 위한 대기
        Thread.sleep(100);

        // 5. 이미지 처리 시도
        boolean success = processImageGeneration(message, imageJob);

        // 6. 상태 업데이트: COMPLETED/FAILED
        if (success) {
            saveGenerationResult(message, imageJob);
            imageJob.setStatus(JobStatus.COMPLETED);
            log.info("✅ [{}] 작업 완료: {}", imageJob.getStatus().name(), jobId);
        } else {
            imageJob.setStatus(JobStatus.FAILED);
            log.info("❌ [{}] 작업 실패: {}", imageJob.getStatus().name(), jobId);
        }
        imageJob.setUpdatedAt(LocalDateTime.now());
        imageJobRepository.save(imageJob);
    }

    private boolean processImageGeneration(ImageJobMessage message, ImageJob imageJob) {
        String jobId = message.jobId();

        for (int attempt = 1; attempt <= MAX_RETRY; attempt++) {
            try {
                log.info("[POSTER-GEN] 이미지 생성 시도 {}/{}: {}", attempt, MAX_RETRY, jobId);

                // S3에서 파일 다운로드 및 요청 준비
                MultiValueMap<String, Object> body = prepareRequestBody(message);
                log.info("[POSTER-GEN] 이미지 로드 완료: {}", jobId);

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.MULTIPART_FORM_DATA);
                HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);

                // Python 서버 호출 시뮬레이션 (실제로는 restTemplate.postForEntity 사용)
                log.info("[POSTER-GEN] 이미지 생성 대기 중: {}", jobId);
                Thread.sleep(30000);

                // 성공 케이스
                if (true) { // 실제로는 response.getStatusCode().is2xxSuccessful()
                    log.info("[POSTER-GEN] 이미지 생성 성공: {}", jobId);
                    return true;
                }

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.error("❌ 이미지 생성 중 인터럽트: {}", jobId, e);
                return false;

            } catch (Exception e) {
                log.error("❌ 이미지 생성 시도 {}/{} 실패: {} - {}",
                        attempt, MAX_RETRY, jobId, e.getMessage());

                if (attempt == MAX_RETRY) {
                    log.error("❌ 최대 재시도 횟수 도달: {}", jobId, e);
                    return false;
                }

                // 재시도 전 대기
                try {
                    Thread.sleep(2000);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    return false;
                }
            }
        }

        return false;
    }

    private MultiValueMap<String, Object> prepareRequestBody(ImageJobMessage message) throws Exception {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        if (message.sketchKey() != null) {
            File sketchFile = s3Service.downloadFile(message.sketchKey());
            body.add("sketchImage", new FileSystemResource(sketchFile));
            log.debug("sketchFile: {}", sketchFile.getName());
        }
        if (message.productKey() != null) {
            File productFile = s3Service.downloadFile(message.productKey());
            body.add("productImage", new FileSystemResource(productFile));
            log.debug("productFile: {}", productFile.getName());
        }
        if (message.modelKey() != null) {
            File modelFile = s3Service.downloadFile(message.modelKey());
            body.add("modelImage", new FileSystemResource(modelFile));
            log.debug("modelFile: {}", modelFile.getName());
        }
        if (message.skeletonKey() != null) {
            File skeletonFile = s3Service.downloadFile(message.skeletonKey());
            body.add("skeletonImage", new FileSystemResource(skeletonFile));
            log.debug("skeletonFile: {}", skeletonFile.getName());
        }
        if (message.previousKey() != null) {
            File previousFile = s3Service.downloadFile(message.previousKey());
            body.add("previousImage", new FileSystemResource(previousFile));
            log.debug("previousFile: {}", previousFile.getName());
        }

        body.add("prompt", message.prompt());
        return body;
    }

    @Transactional
    protected void saveGenerationResult(ImageJobMessage message, ImageJob imageJob) throws Exception {
        String jobId = message.jobId();

        // PosterGroup 생성 or 조회
        User userRef = userRepository.getReferenceById(message.userId());
        PosterGroup posterGroup;

        if (message.groupId() != null) {
            posterGroup = posterGroupRepository.findById(message.groupId())
                    .orElseThrow(() -> new RuntimeException("PosterGroup not found: " + jobId));
            log.info("[POSTER-GEN] 포스터 그룹 조회: {}", message.groupId());
        } else {
            posterGroup = PosterGroup.builder()
                    .user(userRef)
                    .title(message.title())
                    .content(message.content())
                    .createdAt(LocalDateTime.now())
                    .build();
            posterGroupRepository.saveAndFlush(posterGroup);
            log.info("[POSTER-GEN] 포스터 그룹 생성: {}", posterGroup.getId());
        }

        // Poster 엔티티 생성
        Poster poster = Poster.builder()
                .posterGroup(posterGroup)
                .prompt(message.prompt())
                .imgUrl("s3:pending")
                .createdAt(LocalDateTime.now())
                .build();
        posterRepository.saveAndFlush(poster);
        log.info("[POSTER-GEN] 포스터 저장: {}", poster.getId());

        // 더미 이미지 생성 및 S3 업로드
        byte[] imageBytes = generateDummyPng(message.title(), message.prompt());
        String key = s3Service.buildKey("poster_" + poster.getId() + ".png");
        s3Service.upload(key, imageBytes, "image/png");
        poster.setImgUrl(s3Service.toS3Uri(key));

        // 대표 포스터 변경
        posterGroup.setMainPoster(poster);
        imageJob.setResultPoster(poster);
        log.info("[POSTER-GEN] 결과 저장 성공: {}", jobId);
    }

    // --- 더미 이미지 생성 코드 ---
    private static byte[] generateDummyPng(String title, String slogan) {
        try {
            int W = 512, H = 512;
            BufferedImage img = new BufferedImage(W, H, BufferedImage.TYPE_INT_ARGB);
            Graphics2D g = img.createGraphics();
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

            g.setColor(new Color(0xF2F7FA));
            g.fillRect(0, 0, W, H);
            g.setColor(new Color(0x46A9DB));
            g.fillOval(W / 2 - 120, H / 2 - 120, 240, 240);
            g.setColor(new Color(0x193747));

            g.setFont(new Font("SansSerif", Font.BOLD, 28));
            drawCentered(g, (title == null ? "" : title), W / 2, H / 2 + 10);

            g.setFont(new Font("SansSerif", Font.PLAIN, 16));
            drawCentered(g, (slogan == null ? "" : slogan), W / 2, H / 2 + 40);

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
        int x = cx - fm.stringWidth(text) / 2;
        int y = cy - fm.getHeight() / 2 + fm.getAscent();
        g.drawString(text, x, y);
    }

    @Override
    public ImageJobResponse getStatus(String jobId) {

        // 1. Job DB 조회
        ImageJob job = imageJobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("해당 JobId가 존재하지 않습니다: " + jobId));

        // 2. 상태에 따른 분기 처리
        return switch (job.getStatus()) {
            // 2-1. QUEUED/PROCESSING/FAILED -> Job 상태만 반환
            case QUEUED, PROCESSING, FAILED ->
                new ImageJobResponse(
                        job.getId(),
                        job.getStatus(),
                        job.getCreatedAt()
                );
            // 2-2. COMPLETED -> 결과 포스터 포함 반환
            case COMPLETED -> {
                Poster poster = job.getResultPoster();
                PosterResponse posterResponse = new PosterResponse(
                        poster.getId(),
                        poster.getPosterGroup().getId(),
                        poster.getImgUrl()
                );
                yield new ImageJobResponse(
                        job.getId(),
                        job.getStatus(),
                        job.getCreatedAt(),
                        posterResponse
                );
            }
        };
    }
}
