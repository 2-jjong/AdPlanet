package com.ssafy.adplanet.service.ci;

import com.ssafy.adplanet.dto.ci.CiGuidelineDefaults;
import com.ssafy.adplanet.dto.ci.CiGuidelineResponse;
import com.ssafy.adplanet.entity.CiGuideline;
import com.ssafy.adplanet.entity.CiGuidelineTemplate;
import com.ssafy.adplanet.entity.Logo;
import com.ssafy.adplanet.mapper.CiGuidelineMapper;
import com.ssafy.adplanet.repository.CiGuidelineRepository;
import com.ssafy.adplanet.repository.CiGuidelineTemplateRepository;
import com.ssafy.adplanet.repository.LogoRepository;
import com.ssafy.adplanet.service.gms.GmsService;
import com.ssafy.adplanet.service.gms.GmsService.PalettePayload;
import com.ssafy.adplanet.service.gms.GmsService.PalettePayload.ColorGuide;
import com.ssafy.adplanet.service.s3.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CiGuidelineServiceImpl implements CiGuidelineService {

    private final CiGuidelineRepository ciRepo;
    private final CiGuidelineTemplateRepository tplRepo;
    private final LogoRepository logoRepo;
    private final S3Service s3Service;
    private final GmsService gms;

    @Transactional
    public CiGuidelineResponse createWithImageAi(Long logoId) {
        Logo logo = logoRepo.findById(logoId)
                .orElseThrow(() -> new IllegalArgumentException("logo not found: " + logoId));
        if (ciRepo.existsByLogoId(logoId)) {
            throw new IllegalStateException("이미 CI 가이드라인이 존재합니다.");
        }

        // 1) 로고 이미지 프리사인 URL (20분)
        String imageUrl = s3Service.presignFromUri(logo.getImgUrl(), Duration.ofMinutes(20));

        PalettePayload p;
        try {
            log.info("[CI] GMS 요청 시작: brand='{}', slogan='{}', img='{}'", logo.getName(), logo.getSlogan(), imageUrl);
            p = gms.generatePaletteByImage(logo.getName(), logo.getSlogan(), imageUrl);
            log.info("[CI] GMS 응답 수신: primary={}, secondary={}, neutral={}",
                    p.getPrimaryColor(), p.getSecondaryColor(), p.getNeutralColor());
        } catch (Exception e) {
            log.warn("[CI] GMS 실패로 기본값 사용: {} (cause: {})",
                    e.getMessage(), (e.getCause() != null ? e.getCause().getClass().getSimpleName() : "-"));
            p = new PalettePayload();
            p.setPrimaryColor(CiGuidelineDefaults.PRIMARY_COLOR);
            p.setSecondaryColor(CiGuidelineDefaults.SECONDARY_COLOR);
            p.setNeutralColor(CiGuidelineDefaults.NEUTRAL_COLOR);

            ColorGuide pg = new ColorGuide();
            pg.setHex("#4FB1BA"); pg.setRgb("79, 177, 186"); pg.setCMYK("65, 10, 25, 0"); pg.setMainUsage("로고, 주요 버튼, 강조 요소");
            p.setPrimaryGuide(pg);

            ColorGuide sg = new ColorGuide();
            sg.setHex("#193747"); sg.setRgb("25, 55, 71"); sg.setCMYK("90, 65, 50, 40"); sg.setMainUsage("텍스트, 배경, 보조 그래픽");
            p.setSecondaryGuide(sg);

            p.setNeutralGuide(CiGuidelineDefaults.NEUTRAL_GUIDE);
        }

        // 3) 최신 템플릿
        CiGuidelineTemplate tpl = tplRepo.findTopByOrderByIdDesc()
                .orElseThrow(() -> new IllegalStateException("CI 템플릿이 없습니다."));

        // 4) 엔티티 저장 (가이드는 문자열 블록으로 변환하여 저장)
        CiGuideline entity = CiGuideline.builder()
                .logo(logo)
                .template(tpl)
                .primaryColor(fixHex(p.getPrimaryColor()))
                .secondaryColor(fixHex(p.getSecondaryColor()))
                .neutralColor(fixHex(p.getNeutralColor()))
                .primaryGuide(guideToBlock(p.getPrimaryGuide()))
                .secondaryGuide(guideToBlock(p.getSecondaryGuide()))
                .neutralGuide(p.getNeutralGuide())
                .build();

        return CiGuidelineMapper.toResponse(ciRepo.save(entity));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<CiGuidelineResponse> getByLogoId(Long logoId) {
        if (logoId == null || logoId <= 0) throw new IllegalArgumentException("logoId가 유효하지 않습니다.");
        return ciRepo.findByLogoIdWithTemplate(logoId)
                .map(CiGuidelineMapper::toResponse);
    }

    // ---- helpers ----

    private static String fixHex(String hex) {
        if (hex == null) return null;
        String h = hex.trim().toUpperCase();
        if (!h.startsWith("#")) h = "#" + h;
        return h;
    }

    // ColorGuide 객체 → 우리가 쓰던 문자열 블록으로 변환
    private static String guideToBlock(ColorGuide g) {
        if (g == null) return null;
        String hex   = safe(g.getHex());
        String rgb   = safe(g.getRgb());
        String cmyk  = safe(g.getCMYK());
        String usage = safe(g.getMainUsage());

        StringBuilder sb = new StringBuilder();
        sb.append("Hex\n- ").append(hex.isBlank() ? "#000000" : hex).append('\n')
                .append("RGB\n- ").append(rgb.isBlank() ? "0, 0, 0" : rgb).append('\n')
                .append("CMYK\n- ").append(cmyk.isBlank() ? "0, 0, 0, 100" : cmyk).append('\n')
                .append("주 사용처\n- ").append(usage.isBlank() ? "로고, 주요 버튼, 강조 요소" : usage);
        return sb.toString();
    }

    private static String safe(String s) { return s == null ? "" : s.trim(); }
}
