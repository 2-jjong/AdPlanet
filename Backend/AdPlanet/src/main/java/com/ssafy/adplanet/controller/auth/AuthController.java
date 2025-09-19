package com.ssafy.adplanet.controller.auth;

import com.ssafy.adplanet.dto.ResponseDto;
import com.ssafy.adplanet.dto.auth.LoginRequest;
import com.ssafy.adplanet.dto.auth.LoginTokens;
import com.ssafy.adplanet.dto.auth.oauth.SSAFYLoginResponseDto;
import com.ssafy.adplanet.service.auth.AuthService;
import com.ssafy.adplanet.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "인증/인가", description = "인증 및 인가 관리 API")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(
            summary = "OAuth 로그인",
            description = "OAuth 인가 코드를 사용하여 로그인을 수행합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "로그인 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })
    public ResponseEntity<ResponseDto<Void>> login(
            @Parameter(description = "OAuth 인가 코드", required = true)
            @RequestBody LoginRequest request) {

        try {
            // SSAFY OAuth 로그인 처리 및 JWT 토큰 발급
//            LoginTokens tokens = authService.login(request.code());

            // SSAFY OAuth 로그인이 Redirect 이중 검증을 하기 때문에 개발 단계에서 사용하는 메소드
            LoginTokens tokens = authService.loginForTest(request.code());
            
            // 리프레시 토큰을 쿠키에 설정
            ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", tokens.refreshToken())
                    .httpOnly(true)
                    .secure(true)
                    .sameSite("Strict")
                    .path("/")
                    .maxAge(7 * 24 * 60 * 60) // 7일
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

    @PostMapping("/reissue")
    @Operation(
            summary = "토큰 재발급",
            description = "리프레시 토큰을 사용하여 액세스 토큰과 리프레시 토큰을 재발급합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "재발급 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "401", description = "유효하지 않은 리프레시 토큰")
    })
    public ResponseEntity<ResponseDto<Void>> reissue(HttpServletRequest request) {
        try {
            // 쿠키에서 RefreshToken 추출
            String refreshToken = null;
            if (request.getCookies() != null) {
                for (var cookie : request.getCookies()) {
                    if ("refresh_token".equals(cookie.getName())) {
                        refreshToken = cookie.getValue();
                        break;
                    }
                }
            }

            if (refreshToken == null) {
                return ResponseEntity.status(401)
                        .body(ResponseDto.error("A4011", "RefreshToken이 없습니다"));
            }

            // 토큰 갱신
            LoginTokens tokens = authService.reissueTokens(refreshToken);

            // 새 리프레시 토큰을 쿠키에 설정
            ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", tokens.refreshToken())
                    .httpOnly(true)
                    .secure(true)
                    .sameSite("Strict")
                    .path("/")
                    .maxAge(7 * 24 * 60 * 60) // 7일
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokens.accessToken())
                    .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                    .body(ResponseDto.ok(null));

        } catch (Exception e) {
            return ResponseEntity.status(401)
                    .body(ResponseDto.error("A4012", "토큰 갱신 실패: " + e.getMessage()));
        }
    }

    @PostMapping("/logout")
    @Operation(
            summary = "로그아웃",
            description = "로그아웃을 수행하고 토큰을 삭제합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "로그아웃 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })
    public ResponseEntity<ResponseDto<Void>> logout() {
        try {

            Long userId = SecurityUtil.getCurrentUserId();
            authService.logout(userId);

            // 리프레시 토큰 쿠키 삭제
            ResponseCookie deleteCookie = ResponseCookie.from("refresh_token", "")
                    .httpOnly(true)
                    .secure(true)
                    .sameSite("Strict")
                    .path("/")
                    .maxAge(0) // 즉시 만료
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                    .body(ResponseDto.ok(null));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ResponseDto.error("A4013", "로그아웃 실패"));
        }
    }
}