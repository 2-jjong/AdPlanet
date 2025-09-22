package com.ssafy.adplanet.service.s3;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3ServiceImpl implements S3Service {

    private final S3Client s3;
    private final S3Presigner presigner;

    @Value("${adplanet.s3.bucket}") private String bucket;
    @Value("${adplanet.s3.prefix:}") private String prefix;
    @Value("${adplanet.s3.presign-minutes:60}") private int presignMinutes;

    @Override
    public String buildKey(String filename) {
        return ensureSlash(prefix) + sanitize(filename);
    }

    @Override
    public void upload(String key, byte[] bytes, String contentType) {
        PutObjectRequest req = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(contentType)
                .build();
        s3.putObject(req, RequestBody.fromBytes(bytes));
    }

    @Override
    public void upload(String key, File file, String contentType) {
        PutObjectRequest req = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(contentType)
                .build();
        s3.putObject(req, RequestBody.fromFile(file));
    }

    @Override
    public void upload(String key, InputStream inputStream, String contentType) {
        try {
            PutObjectRequest req = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(contentType)
                    .build();

            s3.putObject(req, RequestBody.fromInputStream(inputStream, inputStream.available()));
        } catch (Exception e) {
            throw new RuntimeException("S3 업로드 실패", e);
        }
    }

    @Override
    public String presignGet(String key) {
        return presignGet(key, Duration.ofMinutes(presignMinutes));
    }

    @Override
    public String presignGet(String key, Duration duration) {
        GetObjectRequest get = GetObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build();

        var presigned = presigner.presignGetObject(
                GetObjectPresignRequest.builder()
                        .signatureDuration(duration)
                        .getObjectRequest(get)
                        .build()
        );
        return presigned.url().toString();
    }

    @Override
    public String toS3Uri(String key) {
        return "s3://" + bucket + "/" + key;
    }

    @Override
    public byte[] download(String key) {
        GetObjectRequest get = GetObjectRequest.builder().bucket(bucket).key(key).build();
        ResponseBytes<GetObjectResponse> bytes = s3.getObjectAsBytes(get);
        return bytes.asByteArray();
    }

    @Override
    public File downloadFile(String key) {
        GetObjectRequest get = GetObjectRequest.builder().bucket(bucket).key(key).build();

        String tmpDir = System.getProperty("java.io.tmpdir");
        File dir = new File(tmpDir, "s3downloads");
        if (!dir.exists()) dir.mkdirs(); // 디렉터리 없으면 생성

        String filename = "download_" + UUID.randomUUID() + ".png";
        File tempFile = new File(dir, filename);

        s3.getObject(get, tempFile.toPath());
        return tempFile;
    }

    @Override
    public void delete(String key) {
        DeleteObjectRequest del = DeleteObjectRequest.builder().bucket(bucket).key(key).build();
        s3.deleteObject(del);
    }

    @Override
    public boolean exists(String key) {
        try {
            HeadObjectRequest head = HeadObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .build();
            s3.headObject(head);
            return true;

        } catch (NoSuchKeyException e) {
            // 키가 없을 때 명시 예외
            return false;

        } catch (S3Exception e) {
            // 일부 SDK/엔드포인트는 404를 일반 S3Exception(에러코드 "NotFound")로 던지기도 함
            if (e.statusCode() == 404) return false;
            // 또는: "NotFound".equalsIgnoreCase(e.awsErrorDetails().errorCode())
            throw e; // 그 외는 진짜 예외로 올림
        }
    }

    @Override
    public String presignFromUri(String s3Uri) {
        return presignFromUri(s3Uri, Duration.ofMinutes(presignMinutes));
    }

    @Override
    public String presignFromUri(String s3Uri, Duration duration) {
        S3Ref ref = parseS3(s3Uri);
        // URI의 버킷을 그대로 사용하여 프리사인 생성 (설정 버킷과 달라도 동작)
        GetObjectRequest get = GetObjectRequest.builder()
                .bucket(ref.bucket)
                .key(ref.key)
                .build();
        var ps = GetObjectPresignRequest.builder()
                .signatureDuration(duration)
                .getObjectRequest(get)
                .build();
        return presigner.presignGetObject(ps).url().toString();
    }


    // --- helpers ---
    private static String ensureSlash(String p) {
        if (p == null || p.isBlank()) return "";
        return p.endsWith("/") ? p : p + "/";
    }
    private static String sanitize(String name) {
        // 간단한 키 위생 처리 (공백/역슬래시 제거 등)
        return name.replace('\\','/').replace("..","").replaceAll("\\s+","_");
    }

    private static S3Ref parseS3(String uri) {
        if (uri == null || !uri.startsWith("s3://")) throw new IllegalArgumentException("invalid s3 uri: " + uri);
        String no = uri.substring("s3://".length());
        int slash = no.indexOf('/');
        if (slash <= 0) throw new IllegalArgumentException("invalid s3 uri: " + uri);
        return new S3Ref(no.substring(0, slash), no.substring(slash + 1));
    }
    private record S3Ref(String bucket, String key) {}
}
