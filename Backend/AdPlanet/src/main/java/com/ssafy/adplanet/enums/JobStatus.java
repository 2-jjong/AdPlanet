package com.ssafy.adplanet.enums;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "포스터 생성 작업 상태")
public enum JobStatus {
    @Schema(description = "대기 중") QUEUED,
    @Schema(description = "진행 중") PROCESSING,
    @Schema(description = "완료") COMPLETED,
    @Schema(description = "실패") FAILED
}
