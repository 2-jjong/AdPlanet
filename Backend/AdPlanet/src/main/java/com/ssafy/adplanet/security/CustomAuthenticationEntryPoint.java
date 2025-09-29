package com.ssafy.adplanet.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.adplanet.dto.ResponseDto;
import com.ssafy.adplanet.exception.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                        AuthenticationException authException) throws IOException {

        log.error("인증되지 않은 접근 시도 - URI: {}, Message: {}", request.getRequestURI(), authException.getMessage());

        // JWT Filter에서 설정한 구체적인 에러 확인
        ErrorCode errorCode = (ErrorCode) request.getAttribute("jwt_error");
        if (errorCode == null) {
            errorCode = ErrorCode.UNAUTHORIZED;
        }

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");

        ResponseDto<Void> errorResponse = ResponseDto.error(
            errorCode.getCode(),
            errorCode.getMessage()
        );

        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}