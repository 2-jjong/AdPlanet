// com/ssafy/adplanet/service/ci/CiGuidelineServiceImpl.java
package com.ssafy.adplanet.service.ci;

import com.ssafy.adplanet.dto.ci.CiGuidelineDefaults;
import com.ssafy.adplanet.dto.ci.CiGuidelineMapper;
import com.ssafy.adplanet.dto.ci.CiGuidelineResponse;
import com.ssafy.adplanet.entity.CiGuideline;
import com.ssafy.adplanet.entity.Logo;
import com.ssafy.adplanet.external.GmsClient;
import com.ssafy.adplanet.repository.CiGuidelineRepository;
import com.ssafy.adplanet.repository.LogoRepository;
import com.ssafy.adplanet.service.s3.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CiGuidelineServiceImpl implements CiGuidelineService {

    private final CiGuidelineRepository ciRepo;
    private final LogoRepository logoRepo;
    private final S3Service s3Service;
    private final GmsClient gms;

    @Transactional
    public CiGuidelineResponse createWithImageAi(Long logoId) {
        Logo logo = logoRepo.findById(logoId)
                .orElseThrow(() -> new IllegalArgumentException("logo not found: " + logoId));
        if (ciRepo.existsByLogoId(logoId)) {
            throw new IllegalStateException("이미 CI 가이드라인이 존재합니다.");
        }

        // 1) 로고 이미지 프리사인 URL 발급 (s3://bucket/key → HTTP URL)
        String imageUrl = s3Service.presignFromUri(logo.getImgUrl(), Duration.ofMinutes(10));

        // 2) GMS 호출(팔레트만)
        GmsClient.PalettePayload p;
        try {
            p = gms.generatePaletteByImage(logo.getName(), logo.getSlogan(), imageUrl);
        } catch (Exception e) {
            // 실패 시 기본값 폴백
            p = new GmsClient.PalettePayload();
            p.setPrimaryColor(CiGuidelineDefaults.PRIMARY_COLOR);
            p.setSecondaryColor(CiGuidelineDefaults.SECONDARY_COLOR);
            p.setNeutralColor(CiGuidelineDefaults.NEUTRAL_COLOR);
            p.setPrimaryGuide(CiGuidelineDefaults.PRIMARY_GUIDE);
            p.setSecondaryGuide(CiGuidelineDefaults.SECONDARY_GUIDE);
            p.setNeutralGuide(CiGuidelineDefaults.NEUTRAL_GUIDE);
        }

        // 3) 엔티티 생성(로고 사용 규정 5개는 기본값)
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

    @Override
    @Transactional(readOnly = true)
    public Optional<CiGuidelineResponse> getByLogoId(Long logoId) {
        if (logoId == null || logoId <= 0) throw new IllegalArgumentException("logoId가 유효하지 않습니다.");
        return ciRepo.findByLogoId(logoId).map(CiGuidelineMapper::toResponse);
    }

    private static String fixHex(String hex) {
        if (hex == null) return null;
        String h = hex.trim().toUpperCase();
        if (!h.startsWith("#")) h = "#" + h;
        return h;
    }
}
