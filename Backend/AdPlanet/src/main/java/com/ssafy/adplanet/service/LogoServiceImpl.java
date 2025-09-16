package com.ssafy.adplanet.service;

import com.ssafy.adplanet.config.S3Props;
import com.ssafy.adplanet.dto.logo.CreateLogoRequest;
import com.ssafy.adplanet.dto.logo.LogoDto;
import com.ssafy.adplanet.entity.Logo;
import com.ssafy.adplanet.repository.LogoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
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
    private final S3Props s3Props;

    @Override
    @Transactional
    public LogoDto create(Long userId, CreateLogoRequest req) {
        if (userId == null) throw new IllegalArgumentException("userId는 필수입니다.");
        if (req.title() == null || req.title().isBlank()) throw new IllegalArgumentException("title은 필수입니다.");
        if (req.content() == null || req.content().isBlank()) throw new IllegalArgumentException("content는 필수입니다.");
        if (req.prompt() == null || req.prompt().isBlank()) throw new IllegalArgumentException("prompt는 필수입니다.");

        // 1) 엔티티 저장(ID 확보)
        Logo logo = Logo.builder()
                .userId(userId)
                .name(req.title())
                .slogan(req.content())
                .prompt(req.prompt())
                .imgUrl("s3:pending")
                .build();
        logoRepository.saveAndFlush(logo);

        // 2) (임시) 더미 PNG 생성  → 추후 python 응답 바이트로 교체 예정
        byte[] imageBytes = generateDummyPng(req.title(), req.content());

        // 3) S3 업로드
        String key = ensureSlash(s3Props.prefix()) + "logo_" + logo.getId() + ".png";
        s3.putObject(
                PutObjectRequest.builder()
                        .bucket(s3Props.bucket())
                        .key(key)
                        .contentType("image/png")
                        .build(),
                RequestBody.fromBytes(imageBytes)
        );

        // 4) DB에는 영구 식별용 S3 URI 저장
        logo.changeImgUrl("s3://" + s3Props.bucket() + "/" + key);

        // 5) 프리사인 URL 반환(기본 60분)
        int minutes = (s3Props.presignMinutes() == null) ? 60 : s3Props.presignMinutes();
        var getReq = GetObjectRequest.builder().bucket(s3Props.bucket()).key(key).build();
        var presigned = presigner.presignGetObject(
                GetObjectPresignRequest.builder()
                        .signatureDuration(Duration.ofMinutes(minutes))
                        .getObjectRequest(getReq)
                        .build()
        );
        return new LogoDto(logo.getId(), presigned.url().toString());
    }

    // helpers
    private static String ensureSlash(String p) { return (p == null || p.isBlank()) ? "" : (p.endsWith("/") ? p : p + "/"); }

    private static byte[] generateDummyPng(String title, String slogan) {
        try {
            int W = 512, H = 512;
            BufferedImage img = new BufferedImage(W, H, BufferedImage.TYPE_INT_ARGB);
            Graphics2D g = img.createGraphics();
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

            g.setColor(new Color(0xF2F7FA)); g.fillRect(0,0,W,H);
            g.setColor(new Color(0x46A9DB)); g.fillOval(W/2-120, H/2-120, 240, 240);

            g.setColor(new Color(0x193747));
            g.setFont(new Font("SansSerif", Font.BOLD, 28)); drawCentered(g, title, W/2, H/2+10);
            g.setFont(new Font("SansSerif", Font.PLAIN, 16)); drawCentered(g, slogan, W/2, H/2+40);

            g.dispose();
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(img, "png", baos);
            return baos.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("더미 이미지 생성 실패: " + e.getMessage(), e);
        }
    }
    private static void drawCentered(Graphics2D g, String text, int cx, int cy) {
        var fm = g.getFontMetrics();
        int x = cx - fm.stringWidth(text)/2;
        int y = cy - fm.getHeight()/2 + fm.getAscent();
        g.drawString(text, x, y);
    }
}
