package com.ssafy.adplanet.service.s3;

import java.io.File;
import java.io.InputStream;
import java.time.Duration;

public interface S3Service {

    // prefix 설정을 고려해 안전하게 객체 키를 빌드
    String buildKey(String filename);

    // 바이트 업로드 (기본 private)
    void upload(String key, byte[] bytes, String contentType);

    // 파일 업로드
    void upload(String key, File file, String contentType);

    void upload(String key, InputStream inputStream, String contentType);

    // 프리사인 GET (yml의 presign-minutes 기본값 사용)
    String presignGet(String key);

    // 프리사인 GET (커스텀 만료시간)
    String presignGet(String key, Duration duration);

    // s3://bucket/key 형태 URI로 변환
    String toS3Uri(String key);

    // 다운로드
    byte[] download(String key);

    // 다운로드 (파일)
    File downloadFile(String key);

    // 삭제
    void delete(String key);

    // 존재 여부
    boolean exists(String key);

    String presignFromUri(String s3Uri);
    String presignFromUri(String s3Uri, Duration duration);

    default String toHttpUrl(String stored) {
        if (stored == null || stored.isBlank()) return stored;
        try {
            return stored.startsWith("s3://") ? presignFromUri(stored) : stored;
        } catch (Exception e) {
            return stored;
        }
    }
}
