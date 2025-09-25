package com.ssafy.adplanet.exception;

import com.ssafy.adplanet.dto.ResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ResponseDto<Void>> handleBusinessException(BusinessException e) {
        ErrorCode errorCode = e.getErrorCode();

        HttpStatus httpStatus = switch (errorCode) {
            case INVALID_REQUEST_PARAMETER, INVALID_OAUTH_CODE, OAUTH_TOKEN_REQUEST_FAILED, OAUTH_USER_INFO_REQUEST_FAILED,
                 IMAGE_JOB_NOT_FOUND, POSTER_GROUP_NOT_FOUND, POSTER_NOT_FOUND,
                 LOGO_INVALID_REQUEST, LOGO_NOT_FOUND, LOGO_TAG_NOT_FOUND, LOGO_CI_CONFLICT,
                 TAG_ALREADY_EXISTS, TAG_LIST_EMPTY, TAG_NOT_FOUND,
                 WATERMARK_INVALID_FILE, WATERMARK_EMPTY_FILE, WATERMARK_INVALID_IMAGE_FORMAT, WATERMARK_CREATOR_EMPTY, WATERMARK_CONTENT_EMPTY, WATERMARK_NOT_DETECTED, WATERMARK_INVALID_FORMAT -> HttpStatus.BAD_REQUEST;

            case FILE_SIZE_EXCEEDED, REQUEST_SIZE_EXCEEDED -> HttpStatus.PAYLOAD_TOO_LARGE;

            case UNAUTHORIZED, INVALID_TOKEN, TOKEN_EXPIRED, INVALID_REFRESH_TOKEN, EXPIRED_REFRESH_TOKEN, INVALID_TOKEN_TYPE, USER_NOT_FOUND, REFRESH_TOKEN_NOT_FOUND -> HttpStatus.UNAUTHORIZED;

            case POSTER_IMAGE_UPLOAD_FAILED, POSTER_JOB_QUEUE_FAILED, COPY_GENERATION_FAILED, POSTER_PROMPT_REFINEMENT_FAILED,
                 IMAGE_UPLOAD_FAILED, IMAGE_PROCESSING_FAILED,
                 LOGO_AI_SERVER_FAILED, LOGO_IMAGE_EMPTY, LOGO_IMAGE_FORMAT_INVALID, LOGO_IMAGE_TOO_LARGE, LOGO_IMAGE_UPLOAD_FAILED, LOGO_PROMPT_REFINEMENT_FAILED,
                 WATERMARK_INSERTION_FAILED, WATERMARK_DETECTION_FAILED, WATERMARK_IMAGE_PROCESSING_FAILED,
                 INTERNAL_SERVER_ERROR -> HttpStatus.INTERNAL_SERVER_ERROR;
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

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ResponseDto<Void>> handleMaxUploadSizeException(MaxUploadSizeExceededException e) {
        ErrorCode errorCode = e.getMessage() != null && e.getMessage().contains("request")
                ? ErrorCode.REQUEST_SIZE_EXCEEDED
                : ErrorCode.FILE_SIZE_EXCEEDED;

        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(ResponseDto.error(errorCode.getCode(), errorCode.getMessage()));
    }

}