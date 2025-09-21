package com.ssafy.adplanet.exception;

public enum ErrorCode {

    // Common
    INVALID_REQUEST_PARAMETER("E4001", "요청 파라미터가 유효하지 않습니다"),
    INTERNAL_SERVER_ERROR("E5001", "내부 서버 오류가 발생했습니다."),

    // Auth
    INVALID_OAUTH_CODE("AT4001", "유효하지 않은 OAuth 인증 코드입니다"),
    OAUTH_TOKEN_REQUEST_FAILED("AT4002", "OAuth 토큰 요청에 실패했습니다"),
    OAUTH_USER_INFO_REQUEST_FAILED("AT4003", "OAuth 사용자 정보 요청에 실패했습니다"),
    UNAUTHORIZED("AT4011", "인증되지 않은 사용자입니다"),
    INVALID_TOKEN("AT4012", "유효하지 않은 Access 토큰입니다"),
    TOKEN_EXPIRED("AT4013", "만료된 Access 토큰입니다"),
    INVALID_REFRESH_TOKEN("AT4014", "유효하지 않은 Refresh 토큰입니다"),
    EXPIRED_REFRESH_TOKEN("AT4015", "만료된 Refresh 토큰입니다"),
    INVALID_TOKEN_TYPE("AT4016", "Refresh 토큰이 아닙니다"),
    USER_NOT_FOUND("AT4017", "사용자를 찾을 수 없습니다"),
    REFRESH_TOKEN_NOT_FOUND("AT4018", "Refresh 토큰이 없습니다");

    private final String code;
    private final String message;

    ErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}