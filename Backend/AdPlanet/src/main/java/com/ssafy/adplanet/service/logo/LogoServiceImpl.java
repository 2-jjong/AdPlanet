package com.ssafy.adplanet.service.logo;

import com.ssafy.adplanet.dto.logo.CreateLogoRequest;
import com.ssafy.adplanet.dto.logo.LogoDto;
import com.ssafy.adplanet.entity.Logo;
import com.ssafy.adplanet.enums.LogoStyle;
import com.ssafy.adplanet.repository.LogoRepository;
import com.ssafy.adplanet.service.s3.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;

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

        // 1) DB 선저장 (키 생성용 ID 필요)
        Logo logo = Logo.builder()
                .userId(userId)
                .name(req.title())
                .slogan(slogan)
                .prompt(req.prompt())
                .style(style)
                .imgUrl("s3:pending")
                .build();
        logoRepository.saveAndFlush(logo);

        // 2) 이미지 생성 (실제론 생성형 AI 결과물 사용)
        byte[] imageBytes = generateDummyPng(req.title(), slogan);

        // 3) 업로드 + URI 저장
        String key = s3Service.buildKey("logo_" + logo.getId() + ".png");
        s3Service.upload(key, imageBytes, "image/png");
        logo.changeImgUrl(s3Service.toS3Uri(key));

        // 4) 프리사인 URL 발급 후 응답
        String presignedUrl = s3Service.presignGet(key);
        return new LogoDto(logo.getId(), presignedUrl);
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
