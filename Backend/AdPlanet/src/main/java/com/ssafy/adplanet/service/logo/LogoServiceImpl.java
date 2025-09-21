package com.ssafy.adplanet.service.logo;

import com.ssafy.adplanet.dto.logo.*;
import com.ssafy.adplanet.dto.tag.TagDto;
import com.ssafy.adplanet.entity.Logo;
import com.ssafy.adplanet.entity.User;
import com.ssafy.adplanet.enums.LogoListOrder;
import com.ssafy.adplanet.enums.LogoStyle;
import com.ssafy.adplanet.repository.LogoRepository;
import com.ssafy.adplanet.repository.UserRepository;
import com.ssafy.adplanet.service.ai.AiService;
import com.ssafy.adplanet.service.s3.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.imageio.ImageIO;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class LogoServiceImpl implements LogoService {

    private static final int DEFAULT_W = 800;
    private static final int DEFAULT_H = 600;
    private static final int MAX_BYTES = 20 * 1024 * 1024;

    private final LogoRepository logoRepository;
    private final UserRepository userRepository;
    private final S3Service s3Service;
    private final AiService aiService;

    @Override
    @Transactional
    public LogoDto logoCreate(Long userId, CreateLogoRequest req, LogoStyle style) {
        if (userId == null) throw new IllegalArgumentException("userId는 필수입니다.");
        if (req.title() == null || req.title().isBlank()) throw new IllegalArgumentException("title은 필수입니다.");
        if (req.prompt() == null || req.prompt().isBlank()) throw new IllegalArgumentException("prompt는 필수입니다.");

        String slogan = (req.content() == null) ? "" : req.content().trim();
        User userRef = userRepository.getReferenceById(userId);

        // 1) pending 상태로 먼저 저장 (id 확보)
        Logo logo = Logo.builder()
                .user(userRef)
                .name(req.title())
                .slogan(slogan)
                .prompt(req.prompt())
                .style(style)
                .imgUrl("s3:pending")
                .build();
        logoRepository.saveAndFlush(logo);

        try {
            // 2) Python 서버 호출 → 바이트 수신
            var genReq = new LogoGenerateRequest(
                    req.title(),
                    slogan,
                    req.prompt(),
                    DEFAULT_W, DEFAULT_H,
                    style
            );
            byte[] rawBytes = aiService.generateLogo(genReq);

            if (rawBytes == null || rawBytes.length == 0) {
                throw new IllegalStateException("AI 서버에서 빈 이미지를 반환했습니다.");
            }
            if (rawBytes.length > MAX_BYTES) {
                throw new IllegalStateException("이미지 용량 초과(" + rawBytes.length + " bytes)");
            }

            byte[] pngBytes = toPng(rawBytes);

            // 4) S3 업로드 & URL 갱신 (png 고정)
            String key = s3Service.buildKey("logos/logo_" + logo.getId() + ".png");
            s3Service.upload(key, pngBytes, "image/png");
            logo.changeImgUrl(s3Service.toS3Uri(key));

            String presignedUrl = s3Service.presignGet(key);
            return new LogoDto(logo.getId(), presignedUrl);

        } catch (Exception e) {
            logoRepository.delete(logo);
            throw e;
        }
    }

    @Override
    public List<LogoListItem> logoList(Long userId, List<Long> tagIds, LogoListOrder order) {
        if (userId == null) throw new IllegalArgumentException("userId는 필수입니다.");
        Sort sort = (order == null ? LogoListOrder.NEWEST : order).toSort();

        List<Logo> logos;
        if (tagIds == null || tagIds.isEmpty()) {
            logos = logoRepository.findByUser_UserId(userId, sort);
        } else {
            List<Long> ids = logoRepository.findIdsByUserIdAndAllTags(userId, tagIds, tagIds.size());
            if (ids.isEmpty()) return List.of();

            logos = logoRepository.findAllWithTagsByIdIn(ids);

            Comparator<Logo> cmp = Comparator.comparing(Logo::getCreatedAt);
            if (order == null || order == LogoListOrder.NEWEST) cmp = cmp.reversed();
            logos.sort(cmp);
        }

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

    private static byte[] toPng(byte[] src) {
        try (var in = new ByteArrayInputStream(src);
             var out = new ByteArrayOutputStream()) {
            var img = ImageIO.read(in);
            if (img == null) throw new IllegalArgumentException("지원하지 않는 이미지 포맷이거나 손상된 데이터입니다.");
            ImageIO.write(img, "png", out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("PNG 변환 실패: " + e.getMessage(), e);
        }
    }
}
