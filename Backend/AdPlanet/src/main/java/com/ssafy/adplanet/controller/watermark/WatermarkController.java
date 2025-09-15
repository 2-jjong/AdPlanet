package com.ssafy.adplanet.controller.watermark;

import com.ssafy.adplanet.dto.ResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/watermarks")
@Tag(name = "워터마크", description = "워터마크 관리 API")
@RequiredArgsConstructor
public class WatermarkController {

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "워터마크 검증",
            description = "업로드된 이미지에서 워터마크를 검증합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })
    public ResponseEntity<ResponseDto<Void>> verifyWatermark(
            @Parameter(description = "검증할 이미지 파일", required = true)
            @RequestParam("image") MultipartFile imageFile) {
        ResponseDto<Void> responseDto = ResponseDto.ok(null);

        return ResponseEntity.ok(responseDto);
    }
}
