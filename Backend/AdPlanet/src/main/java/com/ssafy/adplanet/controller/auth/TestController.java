package com.ssafy.adplanet.controller.auth;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@Tag(name = "테스트", description = "Swagger 테스트용 API")
@RequiredArgsConstructor
public class TestController {

    @GetMapping(value = "/code", produces = "text/plain;charset=UTF-8")
    @Operation(
            summary = "OAuth 인가 코드 추출",
            description = "SSAFY OAuth 리다이렉트에서 인가 코드를 추출합니다. (Swagger 테스트용)"
    )
    public ResponseEntity<String> getCode(@RequestParam("code") String code) {
        return ResponseEntity.ok()
                .contentType(MediaType.valueOf("text/plain;charset=UTF-8"))
                .body(code);
    }
}