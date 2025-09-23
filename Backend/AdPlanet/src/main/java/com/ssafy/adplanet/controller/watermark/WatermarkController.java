package com.ssafy.adplanet.controller.watermark;

import com.ssafy.adplanet.dto.watermark.WatermarkDetectionResponse;
import com.ssafy.adplanet.service.watermark.WatermarkService;
import com.ssafy.adplanet.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/watermarks")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "워터마크 API", description = "이미지 워터마크 삽입/검출 API")
public class WatermarkController {

    private final WatermarkService watermarkService;

    @PostMapping(consumes =  MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "워터마크 삽입", description = "이미지에 LSB 방식으로 '제작자: XXX 내용: XXX' 형식의 워터마크를 삽입합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "워터마크 삽입 성공 - PNG 이미지 반환"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 (파일 없음, 제작자/내용 없음 등)"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    public ResponseEntity<byte[]> insertWatermark(
            @Parameter(description = "워터마크를 삽입할 원본 이미지 파일", required = true)
            @RequestPart("image") MultipartFile imageFile,
            @Parameter(description = "워터마크 내용", required = true, example = "AdPlanet 워터마크")
            @RequestPart("content") String content) {

        String creator = SecurityUtil.getCurrentUserEmail();

        log.info("워터마크 삽입 요청 - 파일명: {}, 파일크기: {}bytes, 제작자: '{}', 내용: '{}'",
                imageFile.getOriginalFilename(), imageFile.getSize(), creator, content);

        byte[] imageBytes = watermarkService.insertWatermark(imageFile, creator, content);

        log.info("워터마크 삽입 성공 - 결과파일크기: {}bytes", imageBytes.length);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        headers.setContentDispositionFormData("attachment", "watermarked_image.png");

        return new ResponseEntity<>(imageBytes, headers, HttpStatus.OK);
    }

    @PostMapping(value = "/detection", consumes =  MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "워터마크 검출", description = "이미지에서 LSB 방식으로 삽입된 워터마크를 검출하여 제작자와 내용을 분리하여 반환합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "워터마크 검출 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 (파일 없음, 워터마크 없음 등)"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    public ResponseEntity<WatermarkDetectionResponse> detectWatermark(
            @Parameter(description = "워터마크가 삽입된 이미지 파일", required = true)
            @RequestPart("image") MultipartFile imageFile) {

        log.info("워터마크 검출 요청 - 파일명: {}, 파일크기: {}bytes",
                imageFile.getOriginalFilename(), imageFile.getSize());

        WatermarkDetectionResponse detectionResult = watermarkService.detectWatermark(imageFile);

        log.info("워터마크 검출 성공 - 제작자: '{}', 내용: '{}'",
                detectionResult.creator(), detectionResult.content());

        return ResponseEntity.ok(detectionResult);
    }
}