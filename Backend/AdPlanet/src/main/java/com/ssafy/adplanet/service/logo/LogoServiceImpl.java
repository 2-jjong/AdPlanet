package com.ssafy.adplanet.service.logo;

import com.ssafy.adplanet.dto.logo.*;
import com.ssafy.adplanet.dto.tag.TagDto;
import com.ssafy.adplanet.entity.Logo;
import com.ssafy.adplanet.entity.User;
import com.ssafy.adplanet.enums.LogoListOrder;
import com.ssafy.adplanet.enums.LogoStyle;
import com.ssafy.adplanet.exception.BusinessException;
import com.ssafy.adplanet.exception.ErrorCode;
import com.ssafy.adplanet.repository.LogoRepository;
import com.ssafy.adplanet.repository.UserRepository;
import com.ssafy.adplanet.service.ai.AiService;
import com.ssafy.adplanet.service.gms.GmsService;
import com.ssafy.adplanet.service.s3.S3Service;
import com.ssafy.adplanet.service.watermark.WatermarkService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.imageio.ImageIO;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.Comparator;
import java.util.List;

import static com.ssafy.adplanet.exception.ErrorCode.*;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class LogoServiceImpl implements LogoService {

    private static final int DEFAULT_W = 800;
    private static final int DEFAULT_H = 800;
    private static final int MAX_BYTES = 20 * 1024 * 1024;

    private final LogoRepository logoRepository;
    private final UserRepository userRepository;
    private final S3Service s3Service;
    private final AiService aiService;
    private final GmsService gmsService;
    private final WatermarkService watermarkService;

    @Override
    @Transactional
    public LogoDto createLogo(Long userId, CreateLogoRequest req, LogoStyle style) {
        // 요청 검증
        if (userId == null || req == null || req.title() == null || req.title().isBlank()
                || req.prompt() == null || req.prompt().isBlank()) {
            throw new BusinessException(LOGO_INVALID_REQUEST);
        }

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

        try {
            // 1) 프롬프트 정제
            String refinedPrompt;
            try {
                String styleStr = (style == null ? null : style.name());
                refinedPrompt = gmsService.refineLogoPrompt(req.title(), slogan, req.prompt(), styleStr);
                log.info("[LOGO] refined prompt: {}", refinedPrompt);
            } catch (BusinessException ex) {
                // GMS에서 이미 도메인 예외로 래핑됨 → 정책에 따라 원문 진행
                log.warn("[LOGO] refineLogoPrompt 실패. 원문 사용: {}", ex.getMessage());
                refinedPrompt = req.prompt();
            } catch (Exception ex) {
                log.warn("[LOGO] refineLogoPrompt 실패(일반 예외). 원문 사용: {}", ex.toString());
                refinedPrompt = req.prompt();
            }

            // 2) Python 서버 호출
            var genReq = new LogoGenerateRequest(
                    refinedPrompt,
                    DEFAULT_W, DEFAULT_H,
                    style
            );

            final byte[] rawBytes;
            try {
                rawBytes = aiService.generateLogo(genReq);
            } catch (Exception ex) {
                throw new BusinessException(LOGO_AI_SERVER_FAILED, ex);
            }

            if (rawBytes == null || rawBytes.length == 0) {
                throw new BusinessException(LOGO_IMAGE_EMPTY);
            }
            if (rawBytes.length > MAX_BYTES) {
                throw new BusinessException(LOGO_IMAGE_TOO_LARGE);
            }

            // 3) PNG 변환
            final byte[] pngBytes;
            try {
                pngBytes = toPng(rawBytes);
            } catch (IllegalStateException ex) {
                throw new BusinessException(LOGO_IMAGE_FORMAT_INVALID, ex);
            }

            // 워터마크 삽입
            byte[] watermarkedBytes = watermarkService.insertWatermark(pngBytes, userRef.getEmail(), req.title());

            // 4) S3 업로드 & URL 갱신
            String key = s3Service.buildKey("logos/logo_" + logo.getId() + ".png");
            s3Service.upload(key, watermarkedBytes, "image/png");
            logo.changeImgUrl(s3Service.toS3Uri(key));
            try {
                s3Service.upload(key, pngBytes, "image/png");
                logo.changeImgUrl(s3Service.toS3Uri(key));
            } catch (Exception ex) {
                throw new BusinessException(LOGO_IMAGE_UPLOAD_FAILED, ex);
            }

            String presignedUrl = s3Service.presignGet(key);
            return new LogoDto(logo.getId(), presignedUrl);

        } catch (BusinessException be) {
            logoRepository.delete(logo);
            throw be;
        } catch (Exception e) {
            logoRepository.delete(logo);
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, e);
        }
    }

    @Override
    public List<LogoListItem> getLogoList(Long userId, List<Long> tagIds, LogoListOrder order) {
        if (userId == null) throw new BusinessException(LOGO_INVALID_REQUEST);
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
    public LogoDetail getLogoDetail(Long userId, Long logoId) {
        if (userId == null || logoId == null || logoId <= 0) {
            throw new BusinessException(LOGO_INVALID_REQUEST);
        }

        Logo logo = logoRepository.findByIdAndUser_UserId(logoId, userId)
                .orElseThrow(() -> new BusinessException(LOGO_NOT_FOUND));

        String imageUrl = s3Service.toHttpUrl(logo.getImgUrl());
        return new LogoDetail(
                logo.getName(),
                logo.getSlogan(),
                imageUrl,
                logo.getPrompt()
        );
    }

    @Override
    public byte[] downloadLogoImage(Long userId, Long logoId) {
        if (userId == null || logoId == null || logoId <= 0) {
            throw new BusinessException(ErrorCode.LOGO_INVALID_REQUEST);
        }

        Logo logo = logoRepository.findByIdAndUser_UserId(logoId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.LOGO_NOT_FOUND));

        String s3Uri = logo.getImgUrl();
        if (s3Uri == null || s3Uri.isBlank()) {
            throw new BusinessException(ErrorCode.LOGO_NOT_FOUND);
        }

        return s3Service.downloadFromUri(s3Uri);
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
