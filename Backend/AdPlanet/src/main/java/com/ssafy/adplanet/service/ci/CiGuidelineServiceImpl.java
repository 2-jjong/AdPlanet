package com.ssafy.adplanet.service.ci;

import com.ssafy.adplanet.dto.ci.CiGuidelineDefaults;
import com.ssafy.adplanet.dto.ci.CiGuidelineMapper;
import com.ssafy.adplanet.dto.ci.CiGuidelineResponse;
import com.ssafy.adplanet.entity.CiGuideline;
import com.ssafy.adplanet.entity.Logo;
import com.ssafy.adplanet.external.GmsClient;
import com.ssafy.adplanet.repository.LogoRepository;
import com.ssafy.adplanet.repository.CiGuidelineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CiGuidelineServiceImpl implements CiGuidelineService {

    private final CiGuidelineRepository ciRepo;
    private final LogoRepository logoRepo;
    private final S3Presigner presigner;
    private final GmsClient gms;


    @Transactional
    public CiGuidelineResponse createWithImageAi(Long logoId) {
        Logo logo = logoRepo.findById(logoId)
                .orElseThrow(() -> new IllegalArgumentException("logo not found: " + logoId));
        if (ciRepo.existsByLogoId(logoId)) {
            throw new IllegalStateException("이미 CI 가이드라인이 존재합니다.");
        }

        // 1) 로고 이미지 S3 프리사인 URL
        var s3 = parseS3(logo.getImgUrl()); // s3://bucket/key
        String imageUrl = presignGetUrl(s3.bucket, s3.key, Duration.ofMinutes(10));

        // 2) GMS 호출(팔레트만)
        GmsClient.PalettePayload p;
        try {
            p = gms.generatePaletteByImage(logo.getName(), logo.getSlogan(), imageUrl);
        } catch (Exception e) {
            // 실패 시 컬러도 기본값으로 폴백
            p = new GmsClient.PalettePayload();
            p.setPrimaryColor(CiGuidelineDefaults.PRIMARY_COLOR);
            p.setSecondaryColor(CiGuidelineDefaults.SECONDARY_COLOR);
            p.setNeutralColor(CiGuidelineDefaults.NEUTRAL_COLOR);
            p.setPrimaryGuide(CiGuidelineDefaults.PRIMARY_GUIDE);
            p.setSecondaryGuide(CiGuidelineDefaults.SECONDARY_GUIDE);
            p.setNeutralGuide(CiGuidelineDefaults.NEUTRAL_GUIDE);
        }

        // 3) 엔티티 생성(로고 사용 규정 5개는 항상 기본값)
        CiGuideline entity = CiGuideline.builder()
                .logo(logo)
                .basicLogoRule(CiGuidelineDefaults.BASIC_LOGO)
                .minSizeRule(CiGuidelineDefaults.MIN_SIZE)
                .marginRule(CiGuidelineDefaults.MARGIN_RULE)
                .backgroundRule(CiGuidelineDefaults.BACKGROUND_RULE)
                .prohibitionRule(CiGuidelineDefaults.PROHIBITION_RULE)
                .primaryColor(fixHex(p.getPrimaryColor()))
                .secondaryColor(fixHex(p.getSecondaryColor()))
                .neutralColor(fixHex(p.getNeutralColor()))
                .primaryGuide(p.getPrimaryGuide())
                .secondaryGuide(p.getSecondaryGuide())
                .neutralGuide(p.getNeutralGuide())
                .build();

        return CiGuidelineMapper.toResponse(ciRepo.save(entity));
    }

    private String presignGetUrl(String bucket, String key, Duration ttl) {
        var get = GetObjectRequest.builder().bucket(bucket).key(key).build();
        var ps = GetObjectPresignRequest.builder()
                .getObjectRequest(get)
                .signatureDuration(ttl)
                .build();
        return presigner.presignGetObject(ps).url().toString();
    }

    private static String fixHex(String hex) {
        if (hex == null) return null;
        String h = hex.trim().toUpperCase();
        if (!h.startsWith("#")) h = "#" + h;
        return h;
    }

    private S3Uri parseS3(String uri) {
        if (uri == null || !uri.startsWith("s3://")) throw new IllegalArgumentException("invalid s3 uri: " + uri);
        String no = uri.substring("s3://".length());
        int slash = no.indexOf('/');
        if (slash <= 0) throw new IllegalArgumentException("invalid s3 uri: " + uri);
        return new S3Uri(no.substring(0, slash), no.substring(slash + 1));
    }

    private record S3Uri(String bucket, String key) {}
}
