package com.ssafy.adplanet.service.logo;

import com.ssafy.adplanet.dto.logo.CreateLogoRequest;
import com.ssafy.adplanet.dto.logo.LogoDto;
import com.ssafy.adplanet.entity.Logo;
import com.ssafy.adplanet.enums.LogoStyle;
import com.ssafy.adplanet.repository.LogoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.time.Duration;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class LogoServiceImpl implements LogoService {

    private final LogoRepository logoRepository;
    private final S3Client s3;
    private final S3Presigner presigner;

    @Value("${adplanet.s3.bucket}") private String bucket;
    @Value("${adplanet.s3.prefix:}") private String prefix;
    @Value("${adplanet.s3.presign-minutes:60}") private int presignMinutes;

    @Override
    @Transactional
    public LogoDto create(Long userId, CreateLogoRequest req) {
        if (userId == null) throw new IllegalArgumentException("userId는 필수입니다.");
        if (req.title() == null || req.title().isBlank()) throw new IllegalArgumentException("title은 필수입니다.");
        if (req.prompt() == null || req.prompt().isBlank()) throw new IllegalArgumentException("prompt는 필수입니다.");
        if (req.style() == null) throw new IllegalArgumentException("style은 필수입니다.");

        String slogan = (req.content() == null) ? "" : req.content().trim();

        Logo logo = Logo.builder()
                .userId(userId)
                .name(req.title())
                .slogan(slogan)
                .prompt(req.prompt())
                .style(req.style())
                .imgUrl("s3:pending")
                .build();
        logoRepository.saveAndFlush(logo);

        byte[] imageBytes = generateDummyPng(req.title(), slogan);

        // 3) S3 업로드
        String key = ensureSlash(prefix) + "logo_" + logo.getId() + ".png";
        s3.putObject(
                PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(key)
                        .contentType("image/png")
                        .build(),
                RequestBody.fromBytes(imageBytes)
        );

        // 4) DB에 S3 URI 저장
        logo.changeImgUrl("s3://" + bucket + "/" + key);

        // 5) 프리사인 발급
        var getReq = GetObjectRequest.builder().bucket(bucket).key(key).build();
        var presigned = presigner.presignGetObject(
                GetObjectPresignRequest.builder()
                        .signatureDuration(Duration.ofMinutes(presignMinutes))
                        .getObjectRequest(getReq)
                        .build()
        );
        return new LogoDto(logo.getId(), presigned.url().toString());
    }

    // helpers
    private static String ensureSlash(String p) {
        if (p == null || p.isBlank()) return "";
        return p.endsWith("/") ? p : p + "/";
    }

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
        if (text == null || text.isBlank()) return; // 빈 문자열이면 스킵
        var fm = g.getFontMetrics();
        int x = cx - fm.stringWidth(text)/2;
        int y = cy - fm.getHeight()/2 + fm.getAscent();
        g.drawString(text, x, y);
    }
}
