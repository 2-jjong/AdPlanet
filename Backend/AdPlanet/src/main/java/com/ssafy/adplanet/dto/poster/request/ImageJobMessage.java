package com.ssafy.adplanet.dto.poster.request;

import com.ssafy.adplanet.enums.JobStatus;

import java.time.LocalDateTime;

/**
 * 포스터 생성 작업
 **/
public record ImageJobMessage(

        /* 작업 기본 정보 */
    String jobId,   // 6dd7db67-5ab4-4ebe-b85f-6165bf6f3050
    Long userId,    // 유저 키
    JobStatus status,   // 작업 상태
    LocalDateTime createdAt,    // 작업 생성일시
    LocalDateTime updatedAt,    // 작업 수정일시

        /* 포스터 그룹 정보 */
    Long groupId,   // 포스터 그룹 키
    String title,       // 제목
    String content,     // 내용

        /* 이미지 생성 요청 값 */
    String prompt,              // 프롬프트
    String backgroundKey,        // 배경 이미지
    String productKey,       // 제품 이미지
    String modelKey         // 모델 이미지
){
    public ImageJobMessage(String jobId, Long userId, JobStatus status, LocalDateTime createdAt, LocalDateTime updatedAt, Long groupId, String prompt) {
        this(jobId, userId, status, createdAt, updatedAt, groupId, null, null, prompt, null, null, null);
    }
}
