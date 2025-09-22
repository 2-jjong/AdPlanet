package com.ssafy.adplanet.exception;

import com.ssafy.adplanet.dto.ResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ResponseDto<Void>> handleBusinessException(BusinessException e) {
        ErrorCode errorCode = e.getErrorCode();

        HttpStatus httpStatus = switch (errorCode) {
            case INVALID_REQUEST_PARAMETER, INVALID_OAUTH_CODE, OAUTH_TOKEN_REQUEST_FAILED, OAUTH_USER_INFO_REQUEST_FAILED,
                    JOB_NOT_FOUND, POSTER_GROUP_NOT_FOUND -> HttpStatus.BAD_REQUEST;
            case UNAUTHORIZED, INVALID_TOKEN, TOKEN_EXPIRED, INVALID_REFRESH_TOKEN, EXPIRED_REFRESH_TOKEN, INVALID_TOKEN_TYPE, USER_NOT_FOUND, REFRESH_TOKEN_NOT_FOUND -> HttpStatus.UNAUTHORIZED;
            case IMAGE_UPLOAD_FAILED, IMAGE_PROCESSING_FAILED, INTERNAL_SERVER_ERROR -> HttpStatus.INTERNAL_SERVER_ERROR;
        };

        return ResponseEntity.status(httpStatus)
                .body(ResponseDto.error(errorCode.getCode(), errorCode.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResponseDto<Void>> handleValidationException(MethodArgumentNotValidException e) {
        String validationMessage = e.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .findFirst()
                .orElse("");

        String errorMessage = ErrorCode.INVALID_REQUEST_PARAMETER.getMessage() + ": " + validationMessage;

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ResponseDto.error(ErrorCode.INVALID_REQUEST_PARAMETER.getCode(), errorMessage));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResponseDto<Void>> handleGeneralException(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ResponseDto.error(ErrorCode.INTERNAL_SERVER_ERROR.getCode(),
                        ErrorCode.INTERNAL_SERVER_ERROR.getMessage()));
    }
}