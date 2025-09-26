package com.ssafy.adplanet.service.poster;

import com.ssafy.adplanet.dto.poster.request.CreatePosterRequest;
import com.ssafy.adplanet.dto.poster.request.EditPosterJobMessage;
import com.ssafy.adplanet.dto.poster.request.GeneratePosterRequest;
import com.ssafy.adplanet.dto.poster.request.CreatePosterJobMessage;
import com.ssafy.adplanet.dto.poster.response.CopyResponse;
import com.ssafy.adplanet.dto.poster.response.ImageJobResponse;
import com.ssafy.adplanet.dto.poster.response.PosterGroupResponse;
import com.ssafy.adplanet.dto.poster.response.PosterResponse;
import com.ssafy.adplanet.entity.*;
import com.ssafy.adplanet.enums.JobStatus;
import com.ssafy.adplanet.enums.PosterListOrder;
import com.ssafy.adplanet.enums.PosterStyle;
import com.ssafy.adplanet.exception.BusinessException;
import com.ssafy.adplanet.exception.ErrorCode;
import com.ssafy.adplanet.repository.ImageJobRepository;
import com.ssafy.adplanet.repository.PosterGroupRepository;
import com.ssafy.adplanet.repository.PosterRepository;
import com.ssafy.adplanet.repository.UserRepository;
import com.ssafy.adplanet.service.ai.AiService;
import com.ssafy.adplanet.service.gms.GmsService;
import com.ssafy.adplanet.service.s3.S3Service;
import com.ssafy.adplanet.service.watermark.WatermarkService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.UUID;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PosterServiceImpl implements PosterService {

    private static final Logger log = LoggerFactory.getLogger(MessageListener.class);

    private final S3Service s3Service;
    private final GmsService gmsService;
    private final AiService aiService;
    private final WatermarkService watermarkService;
    private final JobStatusService jobStatusService;
    private final UserRepository userRepository;
    private final PosterGroupRepository posterGroupRepository;
    private final PosterRepository posterRepository;
    private final ImageJobRepository imageJobRepository;
    private final MessagePublisher messagePublisher;

    private static final int MAX_RETRY = 10;

    @Override
    public ImageJobResponse createPoster(Long userId, PosterStyle style, CreatePosterRequest request, MultipartFile backgroundImage, MultipartFile productImage, MultipartFile modelImage) {

        String jobId = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));

        // 1. PosterGroup 생성 or 조회
        User userRef = userRepository.getReferenceById(userId);
        PosterGroup posterGroup;

        if (request.groupId() != null) {
            posterGroup = posterGroupRepository.findById(request.groupId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.POSTER_GROUP_NOT_FOUND));
            log.info("[POSTER-GEN] 포스터 그룹 조회: {}", request.groupId());

            if (!userId.equals(posterGroup.getUser().getUserId())) {
                throw new BusinessException(ErrorCode.POSTER_GROUP_ACCESS_DENIED);
            }
        } else {
            posterGroup = PosterGroup.builder()
                    .user(userRef)
                    .title(request.title())
                    .content(request.content())
                    .createdAt(now)
                    .build();
            posterGroupRepository.saveAndFlush(posterGroup);
            log.info("[POSTER-GEN] 포스터 그룹 생성: {}", posterGroup.getId());
        }

        // 2. 이미지 S3 저장 & Key 발급
        String backgroundKey = uploadIfExists(backgroundImage, "background", jobId);
        String productKey = uploadIfExists(productImage, "product", jobId);
        String modelKey = uploadIfExists(modelImage, "model", jobId);

        // 3. DB 저장
        ImageJob job = ImageJob.builder()
                .id(jobId)
                .status(JobStatus.QUEUED)
                .createdAt(now)
                .updatedAt(now)
                .posterGroup(posterGroup)
                .build();
        imageJobRepository.save(job);

        // 4. MQ 발행
        CreatePosterJobMessage message = new CreatePosterJobMessage(
                jobId,
                now,
                now,
                posterGroup.getId(),
                request.title(),
                request.content(),
                request.prompt(),
                backgroundKey,
                productKey,
                modelKey
        );
        messagePublisher.sendCreateJob(message);

        // 5. DTO 변환 및 반환
        return new ImageJobResponse(
                jobId,
                job.getStatus(),
                job.getCreatedAt()
        );
    }

    @Override
    public ImageJobResponse editPoster(Long userId, Long posterId, String prompt) {

        String jobId = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now();

        // 1. Poster 조회
        Poster poster = posterRepository.findById(posterId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POSTER_NOT_FOUND));

        // 2. PosterGroup 조회
        PosterGroup posterGroup = poster.getPosterGroup();
        if (!userId.equals(posterGroup.getUser().getUserId())) {
            throw new BusinessException(ErrorCode.POSTER_ACCESS_DENIED);
        }

        // 3. DB 저장
        ImageJob job = ImageJob.builder()
                .id(jobId)
                .status(JobStatus.QUEUED)
                .createdAt(now)
                .updatedAt(now)
                .posterGroup(posterGroup)
                .build();
        imageJobRepository.save(job);

        // 4. MQ 발행
        EditPosterJobMessage message = new EditPosterJobMessage(
                jobId,
                now,
                now,
                posterGroup.getId(),
                prompt,
                poster.getImgUrl()
        );
        messagePublisher.sendEditJob(message);

        // 5. DTO 변환 및 반환
        return new ImageJobResponse(
                jobId,
                job.getStatus(),
                job.getCreatedAt()
        );
    }

    private String uploadIfExists(MultipartFile multipartFile, String prefix, String jobId) {

        if (multipartFile == null || multipartFile.isEmpty()) return null;

        String key = s3Service.buildKey(prefix + "_" + jobId + ".png");

        try (InputStream inputStream = multipartFile.getInputStream()) {
            s3Service.upload(key, inputStream, "image/png");
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.POSTER_IMAGE_UPLOAD_FAILED);
        }

        return key;
    }

    @Override
    @Transactional
    public void processCreateJob(CreatePosterJobMessage message) throws Exception {

        String jobId = message.jobId();

        // 1. 작업 조회
        ImageJob imageJob = imageJobRepository.findById(jobId)
                .orElseThrow(() -> new BusinessException(ErrorCode.IMAGE_JOB_NOT_FOUND));

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
        byte[] bytes = processImageGeneration(message);

        // 6. 상태 업데이트: COMPLETED/FAILED
        if (bytes != null) {
            saveGenerationResult(message.groupId(), message.prompt(), imageJob, bytes);
            imageJob.setStatus(JobStatus.COMPLETED);
            log.info("✅ [{}] 작업 완료: {}", imageJob.getStatus().name(), jobId);
        } else {
            imageJob.setStatus(JobStatus.FAILED);
            log.info("❌ [{}] 작업 실패: {}", imageJob.getStatus().name(), jobId);
        }
        imageJob.setUpdatedAt(LocalDateTime.now(ZoneId.of("Asia/Seoul")));
        imageJobRepository.save(imageJob);
    }

    private byte[] processImageGeneration(CreatePosterJobMessage message) {

        // S3에서 파일 다운로드 및 요청 준비
        GeneratePosterRequest request = prepareRequestBody(message);

        for (int attempt = 1; attempt <= MAX_RETRY; attempt++) {
            try {
                log.info("[POSTER-GEN] 이미지 생성 시도 {}/{}", attempt, MAX_RETRY);

                byte[] bytes = aiService.generatePoster(request);

                // 성공 케이스
                if (bytes != null) {
                    log.info("[POSTER-GEN] 이미지 생성 성공");
                    return bytes;
                }

            } catch (Exception e) {
                log.error("❌ 이미지 생성 시도 {}/{} 실패: {}", attempt, MAX_RETRY, e.getMessage());

                if (attempt == MAX_RETRY) {
                    log.error("❌ 최대 재시도 횟수 도달");
                    return null;
                }

                // 재시도 전 대기
                try {
                    Thread.sleep(2000);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    return null;
                }
            }
        }

        return null;
    }

    private GeneratePosterRequest prepareRequestBody(CreatePosterJobMessage message) {

        byte[] backgroundImage = null;
        byte[] productImage = null;
        byte[] modelImage = null;

        if (message.backgroundKey() != null) {
            backgroundImage = s3Service.download(message.backgroundKey());
        }
        if (message.productKey() != null) {
            productImage = s3Service.download(message.productKey());
        }
        if (message.modelKey() != null) {
            modelImage = s3Service.download(message.modelKey());
        }

        String refinedPrompt = gmsService.refinePosterPrompt(message.prompt());
        log.info("[POSTER-GEN] 정제된 프롬프트: {}", refinedPrompt);

        return GeneratePosterRequest.builder()
                .prompt(refinedPrompt)
                .backgroundImage(backgroundImage)
                .productImage(productImage)
                .modelImage(modelImage)
                .build();
    }

    @Override
    @Transactional
    public void processEditJob(EditPosterJobMessage message) throws Exception {

        String jobId = message.jobId();

        // 1. 작업 조회
        ImageJob imageJob = imageJobRepository.findById(jobId)
                .orElseThrow(() -> new BusinessException(ErrorCode.IMAGE_JOB_NOT_FOUND));

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
        byte[] bytes = processImageEditing(message);

        // 6. 상태 업데이트: COMPLETED/FAILED
        if (bytes != null) {
            saveGenerationResult(message.groupId(), message.prompt(), imageJob, bytes);
            imageJob.setStatus(JobStatus.COMPLETED);
            log.info("✅ [{}] 작업 완료: {}", imageJob.getStatus().name(), jobId);
        } else {
            imageJob.setStatus(JobStatus.FAILED);
            log.info("❌ [{}] 작업 실패: {}", imageJob.getStatus().name(), jobId);
        }
        imageJob.setUpdatedAt(LocalDateTime.now());
        imageJobRepository.save(imageJob);
    }

    private byte[] processImageEditing(EditPosterJobMessage message) {

        // S3에서 파일 다운로드 및 요청 준비
        byte[] bytes = s3Service.downloadFromUri(message.previousImgUrl());
        String refinedPrompt = gmsService.refinePosterPrompt(message.prompt());
        log.info("[POSTER-GEN] 정제된 프롬프트: {}", refinedPrompt);

        for (int attempt = 1; attempt <= MAX_RETRY; attempt++) {
            try {
                log.info("[POSTER-GEN] 이미지 생성 시도 {}/{}", attempt, MAX_RETRY);

                byte[] result = aiService.editPoster(refinedPrompt, bytes);

                // 성공 케이스
                if (result != null) {
                    log.info("[POSTER-GEN] 이미지 생성 성공");
                    return result;
                }

            } catch (Exception e) {
                log.error("❌ 이미지 생성 시도 {}/{} 실패: {}", attempt, MAX_RETRY, e.getMessage());

                if (attempt == MAX_RETRY) {
                    log.error("❌ 최대 재시도 횟수 도달");
                    return null;
                }

                // 재시도 전 대기
                try {
                    Thread.sleep(2000);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    return null;
                }
            }
        }

        return null;
    }

    @Transactional
    protected void saveGenerationResult(Long groupId, String prompt, ImageJob imageJob, byte[] bytes) {

        // PosterGroup 조회
        PosterGroup posterGroup = posterGroupRepository.findById(groupId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POSTER_GROUP_NOT_FOUND));

        // Poster 엔티티 생성
        Poster poster = Poster.builder()
                .posterGroup(posterGroup)
                .prompt(prompt)
                .imgUrl("s3:pending")
                .createdAt(LocalDateTime.now())
                .build();
        posterRepository.saveAndFlush(poster);
        log.info("[POSTER-GEN] 포스터 저장: {}", poster.getId());

        // 워터마크 삽입
        byte[] watermarkedBytes = watermarkService.insertWatermark(bytes, posterGroup.getUser().getEmail(), posterGroup.getTitle());

        // S3 업로드
        String key = s3Service.buildKey("poster_" + poster.getId() + ".png");
        s3Service.upload(key, watermarkedBytes, "image/png");
        poster.setImgUrl(s3Service.toS3Uri(key));

        // 대표 포스터 변경
        posterGroup.setMainPoster(poster);
        imageJob.setResultPoster(poster);
        log.info("[POSTER-GEN] 결과 저장 성공: {}", imageJob.getId());
    }

    @Override
    public ImageJobResponse getStatus(String jobId) {

        // 1. Job DB 조회
        ImageJob job = imageJobRepository.findById(jobId)
                .orElseThrow(() -> new BusinessException(ErrorCode.IMAGE_JOB_NOT_FOUND));

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
                        s3Service.toHttpUrl(poster.getImgUrl())
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

    @Override
    public List<PosterGroupResponse> getAllPosterGroup(Long userId, PosterListOrder order, List<Long> tagIds) {

        Sort sort = (order == null ? PosterListOrder.NEWEST : order).toSort();

        List<PosterGroup> groups;

        if (tagIds == null || tagIds.isEmpty()) {
            groups = posterGroupRepository.findByUser_UserId(userId, sort);
        } else {
            List<Long> ids = posterGroupRepository.findIdsByUserIdAndAllTags(userId, tagIds, tagIds.size());
            if (ids.isEmpty()) return List.of();

            groups = posterGroupRepository.findAllWithTagsByIdIn(ids);

            Comparator<PosterGroup> comparator = Comparator.comparing(PosterGroup::getCreatedAt);
            if (order == null || order == PosterListOrder.NEWEST) comparator = comparator.reversed();
            groups.sort(comparator);
        }

        return groups.stream()
                .map(group -> new PosterGroupResponse(
                        group.getId(),
                        group.getMainPoster() != null
                                ? s3Service.toHttpUrl(group.getMainPoster().getImgUrl())
                                : null,
                        group.getTitle(),
                        group.getContent(),
                        group.getCreatedAt()
                ))
                .toList();
    }

    @Override
    public PosterGroupResponse getPosterGroupDetail(Long groupId) {

        PosterGroup group = posterGroupRepository.findByIdWithMainPosterAndTags(groupId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POSTER_GROUP_NOT_FOUND));

        List<PosterResponse> history = posterRepository.findByPosterGroup_IdOrderByCreatedAtAsc(groupId).stream()
                .map(poster -> new PosterResponse(
                        poster.getId(),
                        s3Service.toHttpUrl(poster.getImgUrl()),
                        poster.getPrompt(),
                        poster.getCreatedAt()
                ))
                .toList();

        return new PosterGroupResponse(
                group.getId(),
                group.getMainPoster() != null
                        ? s3Service.toHttpUrl(group.getMainPoster().getImgUrl())
                        : null,
                group.getTitle(),
                group.getContent(),
                group.getMainPoster() != null ? group.getMainPoster().getPrompt() : null,
                group.getCreatedAt(),
                history
        );
    }

    @Override
    public PosterResponse getPoster(Long posterId) {

        Poster poster = posterRepository.findById(posterId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POSTER_GROUP_NOT_FOUND));

        return new PosterResponse(
                poster.getId(),
                poster.getPosterGroup().getId(),
                s3Service.toHttpUrl(poster.getImgUrl()),
                poster.getPrompt()
        );
    }

    @Override
    public List<ImageJobResponse> getProgressingJobs(Long groupId) {

        posterGroupRepository.findById(groupId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POSTER_GROUP_NOT_FOUND));

        return imageJobRepository.findByPosterGroupIdAndStatus(groupId, JobStatus.PROCESSING).stream()
                .map(job -> new ImageJobResponse(
                        job.getId(),
                        job.getStatus(),
                        job.getCreatedAt()
                ))
                .toList();
    }

    @Override
    public CopyResponse getCopy(Long posterId) {

        Poster poster = posterRepository.findById(posterId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POSTER_NOT_FOUND));

        String copy = gmsService.generateCopyByImage(poster.getPosterGroup().getTitle(), poster.getPosterGroup().getContent(), s3Service.toHttpUrl(poster.getImgUrl()));

        return new CopyResponse(copy);
    }

    @Override
    @Transactional
    public PosterResponse saveImage(Long groupId, MultipartFile image) {

        PosterGroup posterGroup = posterGroupRepository.findById(groupId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POSTER_GROUP_NOT_FOUND));

        // Poster 엔티티 생성
        Poster poster = Poster.builder()
                .posterGroup(posterGroup)
                .prompt("")
                .imgUrl("s3:pending")
                .createdAt(LocalDateTime.now(ZoneId.of("Asia/Seoul")))
                .build();
        posterRepository.saveAndFlush(poster);

        // 워터마크 삽입
        byte[] watermarkedBytes = watermarkService.insertWatermark(image, posterGroup.getUser().getEmail(), posterGroup.getTitle());

        // 이미지 S3 업로드
        String key = s3Service.buildKey("poster_" + poster.getId() + ".png");
        s3Service.upload(key, watermarkedBytes, "image/png");
        poster.setImgUrl(s3Service.toS3Uri(key));

        return new PosterResponse(
                poster.getId(),
                s3Service.toHttpUrl(poster.getImgUrl())
        );
    }

    @Override
    public byte[] downloadPosterImage(Long posterId) {
        Poster poster = posterRepository.findById(posterId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POSTER_NOT_FOUND));

        return s3Service.downloadFromUri(poster.getImgUrl());
    }
}
