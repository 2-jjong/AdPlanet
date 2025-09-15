package com.ssafy.adplanet.controller.auth;

import com.ssafy.adplanet.dto.ResponseDto;
import com.ssafy.adplanet.dto.auth.LoginRequest;
import com.ssafy.adplanet.dto.auth.LoginTokens;
import com.ssafy.adplanet.service.auth.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@Tag(name = "테스트", description = "Swagger 테스트용 API")
@RequiredArgsConstructor
public class TestController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(
            summary = "Swagger용 OAuth 로그인",
            description = "OAuth 인가 코드를 사용하여 로그인을 수행합니다. (Swagger 테스트용)"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "로그인 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })
    public ResponseEntity<ResponseDto<Void>> loginForTest(
            @Parameter(description = "OAuth 인가 코드", required = true)
            @RequestBody LoginRequest request) {

        try {
            LoginTokens tokens = authService.loginForTest(request.code());

            ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", tokens.refreshToken())
                    .httpOnly(true)
                    .secure(true)
                    .sameSite("Strict")
                    .path("/")
                    .maxAge(7 * 24 * 60 * 60)
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokens.accessToken())
                    .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                    .body(ResponseDto.ok(null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ResponseDto.error("A4010", "로그인 실패"));
        }
    }

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