package com.ssafy.adplanet.controller.logo;

import com.ssafy.adplanet.dto.ResponseDto;
import com.ssafy.adplanet.dto.logo.CreateLogoRequest;
import com.ssafy.adplanet.dto.logo.LogoDto;
import com.ssafy.adplanet.service.LogoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/logos")
@RequiredArgsConstructor
public class LogoController {

    private final LogoService logoService;

    @PostMapping
    public ResponseEntity<ResponseDto<LogoDto>> createLogo(
//            @RequestHeader("Authorization") String bearerToken,
            @RequestBody CreateLogoRequest req
    ) {
//        try {
//            LogoDto dto = logoService.create(1L, req);
//            return ResponseEntity.ok(ApiResponse.ok(dto));
//        } catch (IllegalArgumentException e) {
//            return ResponseEntity.badRequest().body(ApiResponse.error("LG4001", e.getMessage()));
//        }
        LogoDto dto = new LogoDto(1L, "image/logo_");
        // 인위적으로 7초 기다렸다가 응답
        try {
            TimeUnit.SECONDS.sleep(7);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return ResponseEntity.ok(ResponseDto.ok(dto));
    }
}
