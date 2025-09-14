package com.ssafy.adplanet.controller.poster;

import com.ssafy.adplanet.dto.ResponseDto;
import com.ssafy.adplanet.dto.poster.response.ImageProcessingJob;
import com.ssafy.adplanet.enums.JobStatus;
import com.ssafy.adplanet.enums.PosterStyle;
import com.ssafy.adplanet.service.PosterService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.cglib.core.Local;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/posters")
@Tag(name = "포스터 API", description = "포스터 생성/관리 API")
public class PosterController {

    private final PosterService posterService;

    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    @Operation(summary = "포스터 생성 요청", description = "포스터 생성 합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "요청 성공"),
            @ApiResponse(responseCode = "500", description = "서버 에러")
    })
    public ResponseEntity<ResponseDto<ImageProcessingJob>> createPoster(
            @Parameter(description = "포스터 스타일")
            @RequestParam(value = "style", required = false) PosterStyle style,
            @Parameter(description = "상세 프롬프트", required = true)
            @RequestPart("prompt") String prompt,
            @Parameter(description = "스케치 이미지")
            @RequestPart(value = "sketchImage", required = false) MultipartFile sketchImage,
            @Parameter(description = "제품 이미지")
            @RequestPart(value = "productImage", required = false) MultipartFile productImage,
            @Parameter(description = "모델 이미지")
            @RequestPart(value = "modelImage", required = false) MultipartFile modelImage
    ) {
        ImageProcessingJob response = new ImageProcessingJob(
                UUID.randomUUID().toString(),
                JobStatus.QUEUED,
                LocalDateTime.now()
        );
        return ResponseEntity.ok(ResponseDto.ok(response));
    }
}
