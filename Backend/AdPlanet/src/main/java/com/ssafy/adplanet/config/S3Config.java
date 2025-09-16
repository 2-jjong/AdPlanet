package com.ssafy.adplanet.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
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
public class S3Config {

    // 설정 값 (@Value)
    @Value("${adplanet.s3.bucket}")
    private String bucket;

    @Value("${adplanet.s3.prefix:}")
    private String prefix;

    // 선택: 비워두면 자동감지/폴백 사용
    @Value("${adplanet.s3.region:}")
    private String regionProp;

    // 자격증명 (비워두면 DefaultCredentialsProvider)
    @Value("${adplanet.s3.access-key:}")
    private String accessKey;

    @Value("${adplanet.s3.secret-key:}")
    private String secretKey;

    @Value("${adplanet.s3.session-token:}")
    private String sessionToken;

    @Bean
    public S3Client s3Client() {
        Region region = resolveRegion();
        log.info("[S3] Using region={}", region);
        return S3Client.builder()
                .region(region)
                .credentialsProvider(creds())
                .serviceConfiguration(S3Configuration.builder().build())
                .build();
    }

    @Bean
    public S3Presigner s3Presigner() {
        Region region = resolveRegion();
        return S3Presigner.builder()
                .region(region)
                .credentialsProvider(creds())
                .build();
    }

    // ---- 내부 유틸 ----
    private AwsCredentialsProvider creds() {
        if (StringUtils.hasText(accessKey) && StringUtils.hasText(secretKey)) {
            if (StringUtils.hasText(sessionToken)) {
                return StaticCredentialsProvider.create(
                        AwsSessionCredentials.create(accessKey, secretKey, sessionToken));
            }
            return StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey));
        }
        return DefaultCredentialsProvider.create();
    }

    private Region resolveRegion() {
        if (StringUtils.hasText(regionProp)) {
            return Region.of(regionProp.trim());
        }
        Optional<Region> byBucket = tryResolveBucketRegion(bucket);
        if (byBucket.isPresent()) return byBucket.get();
        try {
            return new DefaultAwsRegionProviderChain().getRegion();
        } catch (SdkClientException e) {
            log.warn("[S3] Region autodetect failed: {}. Falling back to ap-northeast-2", e.getMessage());
            return Region.AP_NORTHEAST_2; // 폴백(원하면 제거)
        }
    }

    private Optional<Region> tryResolveBucketRegion(String bucket) {
        if (!StringUtils.hasText(bucket)) return Optional.empty();
        try (S3Client tmp = S3Client.builder()
                .region(Region.US_EAST_1)            // GetBucketLocation은 us-east-1에서 호출해도 됨
                .credentialsProvider(creds())
                .build()) {

            GetBucketLocationResponse r = tmp.getBucketLocation(
                    GetBucketLocationRequest.builder().bucket(bucket).build());
            String lc = r.locationConstraintAsString();
            Region resolved = (!StringUtils.hasText(lc)) ? Region.US_EAST_1 : Region.of(lc);
            return Optional.of(resolved);

        } catch (SdkException e) {
            log.warn("[S3] Could not resolve bucket region via GetBucketLocation: {}", e.getMessage());
            return Optional.empty();
        }
    }

    // 서비스에서도 prefix/bucket을 쓰니 getter 있으면 편함(선택)
    public String bucket() { return bucket; }
    public String prefix() { return prefix; }
}
