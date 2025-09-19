package com.ssafy.adplanet.service.poster;

import com.ssafy.adplanet.dto.poster.request.CreatePosterRequest;
import com.ssafy.adplanet.dto.poster.request.ImageJobMessage;
import com.ssafy.adplanet.dto.poster.response.ImageJobResponse;
import com.ssafy.adplanet.dto.poster.response.PosterResponse;
import com.ssafy.adplanet.entity.ImageJob;
import com.ssafy.adplanet.entity.Poster;
import com.ssafy.adplanet.enums.JobStatus;
import com.ssafy.adplanet.enums.PosterStyle;
import com.ssafy.adplanet.repository.ImageJobRepository;
import com.ssafy.adplanet.repository.PosterRepository;
import com.ssafy.adplanet.service.gms.GmsService;
import com.ssafy.adplanet.service.s3.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PosterServiceImpl implements PosterService {

    private final S3Service s3Service;
    private final GmsService gmsService;
    private final PosterRepository posterRepository;
    private final ImageJobRepository imageJobRepository;
    private final MessagePublisher messagePublisher;

    @Override
    public ImageJobResponse create(Long userId, PosterStyle style, CreatePosterRequest request, MultipartFile sketchImage, MultipartFile productImage, MultipartFile modelImage, MultipartFile skeletonImage, MultipartFile previousImage) {

        String jobId = UUID.randomUUID().toString();

        // 1. 시나리오 별로 요청값 검증

        // 2. 이미지 S3 저장

        // 3. MQ 발행
        ImageJobMessage message = new ImageJobMessage(
                jobId,
                userId,
                JobStatus.QUEUED,
                LocalDateTime.now(),
                LocalDateTime.now(),
                request.groupId(),
                request.title(),
                request.content(),
                request.prompt(),
                null,
                null,
                null,
                null,
                null
        );
        messagePublisher.sendJob(message);

        // 4. DB 저장
        ImageJob job = ImageJob.builder()
                .id(jobId)
                .status(JobStatus.QUEUED)
                .createdAt(message.createdAt())
                .updatedAt(message.updatedAt())
                .build();
        imageJobRepository.save(job);

        // 5. DTO 변환 및 반환
        return new ImageJobResponse(
                jobId,
                JobStatus.QUEUED,
                message.createdAt()
        );
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
