package com.ssafy.adplanet.controller.poster;

import com.ssafy.adplanet.dto.ResponseDto;
import com.ssafy.adplanet.dto.poster.response.ImageProcessingJob;
import com.ssafy.adplanet.dto.poster.response.PosterResponse;
import com.ssafy.adplanet.entity.Poster;
import com.ssafy.adplanet.enums.JobStatus;
import com.ssafy.adplanet.enums.PosterStyle;
import com.ssafy.adplanet.service.PosterService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.cglib.core.Local;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
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
    @Operation(summary = "포스터 생성 요청", description = "포스터를 생성 합니다.")
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

    @GetMapping("/jobs/{jobId}")
    @Operation(summary = "포스터 생성 상태 조회", description = "포스터 생성 상태를 조회합니다. 생성 완료 시 결과를 함께 반환합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "500", description = "서버 에러")
    })
    public ResponseEntity<ResponseDto<ImageProcessingJob>> getStatus(
            @Parameter(description = "작업 id", required = true)
            @PathVariable("jobId") String jobId
    ) {
        PosterResponse poster = new PosterResponse(
                1L,
                "https://my-bucket.s3.ap-northeast-2.amazonaws.com/images/2025/09/14/sample-image.png"
        );
        ImageProcessingJob response = new ImageProcessingJob(
                UUID.randomUUID().toString(),
                JobStatus.COMPLETED,
                LocalDateTime.now(),
                poster
        );
        return ResponseEntity.ok(ResponseDto.ok(response));
    }

    @GetMapping("/{posterId}")
    @Operation(summary = "포스터 단건 조회", description = "포스터를 단건 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "500", description = "서버 에러")
    })
    public ResponseEntity<ResponseDto<PosterResponse>> getPoster(
            @Parameter(description = "포스터 id", required = true)
            @PathVariable("posterId") Long posterId
    ) {
        PosterResponse poster = new PosterResponse(
                1L,
                "https://my-bucket.s3.ap-northeast-2.amazonaws.com/images/2025/09/14/sample-image.png",
                "아삭아삭한 배추 이미지, 싱싱한 초록색 활용"
        );
        return ResponseEntity.ok(ResponseDto.ok(poster));
    }
}
