package com.ssafy.adplanet.service.logo;

import com.ssafy.adplanet.dto.logo.CreateLogoRequest;
import com.ssafy.adplanet.dto.logo.LogoDto;
import com.ssafy.adplanet.dto.logo.LogoListItem;
import com.ssafy.adplanet.entity.Logo;
import com.ssafy.adplanet.enums.LogoListOrder;
import com.ssafy.adplanet.enums.LogoStyle;
import com.ssafy.adplanet.repository.LogoRepository;
import com.ssafy.adplanet.service.s3.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class LogoServiceImpl implements LogoService {

    private final LogoRepository logoRepository;
    private final S3Service s3Service;

    @Override
    @Transactional
    public LogoDto create(Long userId, CreateLogoRequest req, LogoStyle style) {
        if (userId == null) throw new IllegalArgumentException("userId는 필수입니다.");
        if (req.title() == null || req.title().isBlank()) throw new IllegalArgumentException("title은 필수입니다.");
        if (req.prompt() == null || req.prompt().isBlank()) throw new IllegalArgumentException("prompt는 필수입니다.");

        String slogan = (req.content() == null) ? "" : req.content().trim();

        // 1) DB 선저장
        Logo logo = Logo.builder()
                .userId(userId)                 // ✅ 옵션 A: Long userId 사용
                .name(req.title())
                .slogan(slogan)
                .prompt(req.prompt())
                .style(style)
                .imgUrl("s3:pending")
                .build();
        logoRepository.saveAndFlush(logo);

        // 2) 더미 이미지(실제에선 생성형 결과 사용)
        byte[] imageBytes = generateDummyPng(req.title(), slogan);

        // 3) 업로드 + URI 저장
        String key = s3Service.buildKey("logo_" + logo.getId() + ".png");
        s3Service.upload(key, imageBytes, "image/png");
        logo.changeImgUrl(s3Service.toS3Uri(key));

        // 4) 프리사인 URL 반환
        String presignedUrl = s3Service.presignGet(key);
        return new LogoDto(logo.getId(), presignedUrl);
    }

    // ✅ 목록 조회 추가
    @Override
    public List<LogoListItem> list(Long userId, List<Long> tagIds, LogoListOrder order) {
        if (userId == null) throw new IllegalArgumentException("userId는 필수입니다.");
        Sort sort = (order == null ? LogoListOrder.NEWEST : order).toSort();

        List<Logo> logos = (tagIds == null || tagIds.isEmpty())
                ? logoRepository.findByUserId(userId, sort)
                : logoRepository.findByUserIdAndAllTags(userId, tagIds, tagIds.size(), sort);

        return logos.stream()
                .map(l -> new LogoListItem(
                        l.getId(),
                        l.getName(),
                        l.getSlogan(),
                        // 목록은 S3 Key/URI를 줄지, 접근가능 URL을 줄지 팀 규칙에 맞추자.
                        // 여기서는 저장된 imgUrl 그대로 사용 (toS3Uri 형태)
                        l.getImgUrl()
                ))
                .toList();
    }

    // --- helpers (기존 더미 생성 코드 유지) ---
    private static byte[] generateDummyPng(String title, String slogan) {
        try {
            int W = 512, H = 512;
            BufferedImage img = new BufferedImage(W, H, BufferedImage.TYPE_INT_ARGB);
            Graphics2D g = img.createGraphics();
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

            g.setColor(new Color(0xF2F7FA)); g.fillRect(0,0,W,H);
            g.setColor(new Color(0x46A9DB)); g.fillOval(W/2-120, H/2-120, 240, 240);
            g.setColor(new Color(0x193747));

            g.setFont(new Font("SansSerif", Font.BOLD, 28));
            drawCentered(g, (title == null ? "" : title), W/2, H/2+10);

            g.setFont(new Font("SansSerif", Font.PLAIN, 16));
            drawCentered(g, (slogan == null ? "" : slogan), W/2, H/2+40);

            g.dispose();
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(img, "png", baos);
            return baos.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("더미 이미지 생성 실패: " + e.getMessage(), e);
        }
    }

    private static void drawCentered(Graphics2D g, String text, int cx, int cy) {
        if (text == null || text.isBlank()) return;
        var fm = g.getFontMetrics();
        int x = cx - fm.stringWidth(text)/2;
        int y = cy - fm.getHeight()/2 + fm.getAscent();
        g.drawString(text, x, y);
    }
}
