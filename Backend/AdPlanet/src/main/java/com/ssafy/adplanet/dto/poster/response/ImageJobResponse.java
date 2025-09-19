package com.ssafy.adplanet.dto.poster.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ssafy.adplanet.enums.JobStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "포스터 생성 작업")
public record ImageJobResponse(

    @Schema(description = "작업 ID", example = "6dd7db67-5ab4-4ebe-b85f-6165bf6f3050")
    String jobId,

    @Schema(description = "작업 상태", example = "QUEUED")
    JobStatus status,

    @Schema(description = "생성 일시", example = "2025-09-13T10:00:00Z")
    LocalDateTime createdAt,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "포스터 생성 결과")
    PosterResponse result
){
    public ImageJobResponse(String jobId, JobStatus status, LocalDateTime createdAt) {
        this(jobId, status, createdAt, null); // ✅ canonical constructor 호출
    }
}
