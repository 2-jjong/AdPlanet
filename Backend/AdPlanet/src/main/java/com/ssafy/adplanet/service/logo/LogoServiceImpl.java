package com.ssafy.adplanet.service.logo;

import com.ssafy.adplanet.dto.logo.CreateLogoRequest;
import com.ssafy.adplanet.dto.logo.LogoDetail;
import com.ssafy.adplanet.dto.logo.LogoDto;
import com.ssafy.adplanet.dto.logo.LogoListItem;
import com.ssafy.adplanet.dto.tag.TagDto;
import com.ssafy.adplanet.entity.Logo;
import com.ssafy.adplanet.entity.User;
import com.ssafy.adplanet.enums.LogoListOrder;
import com.ssafy.adplanet.enums.LogoStyle;
import com.ssafy.adplanet.repository.LogoRepository;
import com.ssafy.adplanet.repository.UserRepository;
import com.ssafy.adplanet.service.s3.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class LogoServiceImpl implements LogoService {

    private final LogoRepository logoRepository;
    private final UserRepository userRepository;
    private final S3Service s3Service;

    @Override
    @Transactional
    public LogoDto logoCreate(Long userId, CreateLogoRequest req, LogoStyle style) {
        if (userId == null) throw new IllegalArgumentException("userId는 필수입니다.");
        if (req.title() == null || req.title().isBlank()) throw new IllegalArgumentException("title은 필수입니다.");
        if (req.prompt() == null || req.prompt().isBlank()) throw new IllegalArgumentException("prompt는 필수입니다.");

        String slogan = (req.content() == null) ? "" : req.content().trim();

        User userRef = userRepository.getReferenceById(userId);

        Logo logo = Logo.builder()
                .user(userRef)
                .name(req.title())
                .slogan(slogan)
                .prompt(req.prompt())
                .style(style)
                .imgUrl("s3:pending")
                .build();
        logoRepository.saveAndFlush(logo);

        byte[] imageBytes = generateDummyPng(req.title(), slogan);

        String key = s3Service.buildKey("logo_" + logo.getId() + ".png");
        s3Service.upload(key, imageBytes, "image/png");
        logo.changeImgUrl(s3Service.toS3Uri(key));

        String presignedUrl = s3Service.presignGet(key);
        return new LogoDto(logo.getId(), presignedUrl);
    }

    @Override
    public List<LogoListItem> logoList(Long userId, List<Long> tagIds, LogoListOrder order) {
        if (userId == null) throw new IllegalArgumentException("userId는 필수입니다.");
        Sort sort = (order == null ? LogoListOrder.NEWEST : order).toSort();

        List<Logo> logos;

        if (tagIds == null || tagIds.isEmpty()) {
            // [A] 태그 미선택: EntityGraph로 tags까지 한 번에
            logos = logoRepository.findByUser_UserId(userId, sort);

        } else {
            // [B] 태그 선택(AND): id 선조회 → fetch-join 재조회 → 서비스에서 정렬
            List<Long> ids = logoRepository.findIdsByUserIdAndAllTags(userId, tagIds, tagIds.size());
            if (ids.isEmpty()) return List.of();

            logos = logoRepository.findAllWithTagsByIdIn(ids);

            // 서비스에서 정렬
            Comparator<Logo> cmp = Comparator.comparing(Logo::getCreatedAt);
            if (order == null || order == LogoListOrder.NEWEST) cmp = cmp.reversed();
            logos.sort(cmp);
        }

        // 매핑 (tags 포함)
        return logos.stream()
                .map(l -> new LogoListItem(
                        l.getId(),
                        l.getName(),
                        l.getSlogan(),
                        s3Service.toHttpUrl(l.getImgUrl()),
                        l.getTags().stream()
                                .map(t -> new TagDto(t.getId(), t.getName()))
                                .toList()
                ))
                .toList();
    }

    @Override
    public LogoDetail logoDetail(Long userId, Long logoId) {
        if (userId == null) throw new IllegalArgumentException("userId는 필수입니다.");
        if (logoId == null || logoId <= 0) throw new IllegalArgumentException("logoId가 유효하지 않습니다.");

        Logo logo = logoRepository.findByIdAndUser_UserId(logoId, userId)
                .orElseThrow(() -> new NoSuchElementException("해당 사용자의 로고를 찾을 수 없습니다."));

        String imageUrl = s3Service.toHttpUrl(logo.getImgUrl());

        return new LogoDetail(
                logo.getName(),
                logo.getSlogan(),
                imageUrl,
                logo.getPrompt()
        );
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
        if (text == null || text.isBlank()) return;
        var fm = g.getFontMetrics();
        int x = cx - fm.stringWidth(text)/2;
        int y = cy - fm.getHeight()/2 + fm.getAscent();
        g.drawString(text, x, y);
    }
}
