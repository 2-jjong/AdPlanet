package com.ssafy.adplanet.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "adplanet.s3")
public record S3Props(String bucket, String prefix, String region,
                      Integer presignMinutes,
                      String accessKey, String secretKey, String sessionToken) {}
