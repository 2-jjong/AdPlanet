// S3Config.java
package com.ssafy.adplanet.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import software.amazon.awssdk.auth.credentials.*;
import software.amazon.awssdk.core.exception.SdkClientException;
import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.regions.providers.DefaultAwsRegionProviderChain;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.GetBucketLocationRequest;
import software.amazon.awssdk.services.s3.model.GetBucketLocationResponse;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.util.Optional;

@Slf4j
@Configuration
@EnableConfigurationProperties(S3Props.class)
public class S3Config {

    @Bean
    public S3Client s3Client(S3Props p) {
        Region region = resolveRegion(p);
        log.info("[S3] Using region={}", region);
        return S3Client.builder()
                .region(region)
                .credentialsProvider(creds(p))              // 크레덴셜 주입
                .serviceConfiguration(S3Configuration.builder().build())
                .build();
    }

    @Bean
    public S3Presigner s3Presigner(S3Props p) {
        Region region = resolveRegion(p);
        return S3Presigner.builder()
                .region(region)
                .credentialsProvider(creds(p))              // 크레덴셜 주입
                .build();
    }

    // ⬇️ adplanet.s3.access-key/secret-key/session-token 을 실제 AWS Credentials로 변환
    private AwsCredentialsProvider creds(S3Props p) {
        if (p.accessKey() != null && !p.accessKey().isBlank()
                && p.secretKey() != null && !p.secretKey().isBlank()) {
            if (p.sessionToken() != null && !p.sessionToken().isBlank()) {
                return StaticCredentialsProvider.create(
                        AwsSessionCredentials.create(p.accessKey(), p.secretKey(), p.sessionToken()));
            }
            return StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(p.accessKey(), p.secretKey()));
        }
        // 값이 없으면 기존 기본 체인(환경변수/AWS 프로파일/IMDS)
        return DefaultCredentialsProvider.create();
    }

    private Region resolveRegion(S3Props p) {
        // 1) 명시값 우선
        if (p.region() != null && !p.region().isBlank()) {
            return Region.of(p.region().trim());
        }
        // 2) 버킷 리전 조회 (여기도 동일 크레덴셜로 호출)
        Optional<Region> byBucket = tryResolveBucketRegion(p.bucket(), p);
        if (byBucket.isPresent()) return byBucket.get();

        // 3) 기본 체인 (환경변수/AWS 프로파일/IMDS)
        try {
            return new DefaultAwsRegionProviderChain().getRegion();
        } catch (SdkClientException e) {
            log.warn("[S3] Region autodetect failed: {}. Falling back to ap-northeast-2", e.getMessage());
            return Region.AP_NORTHEAST_2;
        }
    }

    private Optional<Region> tryResolveBucketRegion(String bucket, S3Props p) {
        if (bucket == null || bucket.isBlank()) return Optional.empty();
        try (S3Client tmp = S3Client.builder()
                .region(Region.US_EAST_1)        // GetBucketLocation은 us-east-1에서도 동작
                .credentialsProvider(creds(p))
                .build()) {

            GetBucketLocationResponse r = tmp.getBucketLocation(
                    GetBucketLocationRequest.builder().bucket(bucket).build());

            String lc = r.locationConstraintAsString();
            Region resolved = (lc == null || lc.isBlank()) ? Region.US_EAST_1 : Region.of(lc);
            return Optional.of(resolved);

        } catch (SdkException e) {
            log.warn("[S3] Could not resolve bucket region via GetBucketLocation: {}", e.getMessage());
            return Optional.empty();
        }
    }
}
