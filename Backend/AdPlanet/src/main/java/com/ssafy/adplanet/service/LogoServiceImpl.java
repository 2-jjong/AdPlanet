package com.ssafy.adplanet.service;

import com.ssafy.adplanet.dto.logo.CreateLogoRequest;
import com.ssafy.adplanet.dto.logo.LogoDto;
import com.ssafy.adplanet.entity.Logo;
import com.ssafy.adplanet.repository.LogoRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@Transactional
@RequiredArgsConstructor
public class LogoServiceImpl implements LogoService{

    private final LogoRepository logoRepository;

    @Override
    public LogoDto create(Long userId, CreateLogoRequest req) {

        if (userId == null) throw new IllegalArgumentException("userId는 필수입니다.");
        if (req.title() == null || req.title().isBlank()) throw new IllegalArgumentException("title은 필수입니다.");
        if (req.prompt() == null || req.prompt().isBlank()) throw new IllegalArgumentException("prompt는 필수입니다.");

        Logo logo = Logo.builder()
                .userId(userId)
                .name(req.title())
                .slogan(req.content())
                .prompt(req.prompt())
                .imgUrl("image/pending")
                .build();

        logoRepository.save(logo);
        logo.changeImgUrl("image/logo_" + logo.getId());

        // 인위적으로 7초 기다렸다가 응답
        try {
            TimeUnit.SECONDS.sleep(7);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return new LogoDto(logo.getId(), logo.getImgUrl());
    }
}
