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
    REFRESH_TOKEN_NOT_FOUND("AT4017", "Refresh 토큰이 없습니다"),
    USER_NOT_FOUND("AT4018", "사용자를 찾을 수 없습니다"),

    // Poster
    JOB_NOT_FOUND("PA4001", "작업을 찾을 수 없습니다"),
    POSTER_GROUP_NOT_FOUND("PA4002", "포스터 그룹을 찾을 수 없습니다"),
    POSTER_NOT_FOUND("PA4003", "포스터를 찾을 수 없습니다"),
    IMAGE_UPLOAD_FAILED("PA5001", "이미지 업로드에 실패했습니다"),
    IMAGE_PROCESSING_FAILED("PA5002", "이미지 생성 요청에 실패했습니다"),
    
    // Tag
    TAG_ALREADY_EXISTS("TG4001", "이미 존재하는 태그입니다"),
    TAG_LIST_EMPTY("TG4002", "태그 목록이 비어 있습니다"),
    TAG_NOT_FOUND("TG4003", "태그를 찾을 수 없습니다");

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