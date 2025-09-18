package com.ssafy.adplanet.controller.poster;

import com.ssafy.adplanet.dto.ResponseDto;
import com.ssafy.adplanet.dto.poster.request.CreatePosterRequest;
import com.ssafy.adplanet.dto.poster.request.PosterTagRequest;
import com.ssafy.adplanet.dto.poster.response.*;
import com.ssafy.adplanet.enums.JobStatus;
import com.ssafy.adplanet.enums.PosterDownloadFormat;
import com.ssafy.adplanet.enums.PosterListOrder;
import com.ssafy.adplanet.enums.PosterStyle;
import com.ssafy.adplanet.service.poster.PosterService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/posters")
@Tag(name = "포스터 API", description = "포스터 생성/관리 API")
public class PosterController {

    private final PosterService posterService;

    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_OCTET_STREAM_VALUE })
    @Operation(summary = "포스터 생성 요청", description = "포스터 생성을 요청합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "요청 성공"),
            @ApiResponse(responseCode = "500", description = "서버 에러")
    })
    public ResponseEntity<ResponseDto<ImageProcessingJob>> createPoster(
            @Parameter(description = "포스터 스타일")
            @RequestParam(value = "style", required = false) PosterStyle style,
            @Parameter(description = "요청 정보", required = true)
            @RequestPart(value = "request") CreatePosterRequest request,
            @Parameter(description = "스케치 이미지")
            @RequestPart(value = "sketchImage", required = false) MultipartFile sketchImage,
            @Parameter(description = "제품 이미지")
            @RequestPart(value = "productImage", required = false) MultipartFile productImage,
            @Parameter(description = "모델 이미지")
            @RequestPart(value = "modelImage", required = false) MultipartFile modelImage,
            @Parameter(description = "구도 이미지")
            @RequestPart(value = "skeletonImage", required = false) MultipartFile skeletonImage,
            @Parameter(description = "이전 이미지")
            @RequestPart(value = "previousImage", required = false) MultipartFile previousImage
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
                1L,
                "https://my-bucket.s3.ap-northeast-2.amazonaws.com/images/2025/09/14/sample-image.png",
                "아삭아삭한 배추 이미지, 싱싱한 초록색 활용"
        );
        return ResponseEntity.ok(ResponseDto.ok(poster));
    }

    @GetMapping("/{posterId}/copy")
    @Operation(summary = "포스터 문구 생성", description = "포스터 문구를 자동 생성합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "500", description = "서버 에러")
    })
    public ResponseEntity<ResponseDto<CopyResponse>> getPosterCopy(
            @Parameter(description = "포스터 id", required = true)
            @PathVariable("posterId") Long posterId
    ) {
        CopyResponse response = new CopyResponse(
                "시원한 청정라거, 테라!"
        );
        return ResponseEntity.ok(ResponseDto.ok(response));
    }

    @PostMapping(value = "/save", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    @Operation(summary = "포스터 저장", description = "문구를 포함한 포스터 이미지를 저장합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "저장 성공"),
            @ApiResponse(responseCode = "500", description = "서버 에러")
    })
    public ResponseEntity<ResponseDto<PosterResponse>> createPosterCopy(
            @Parameter(description = "이미지", required = true)
            @RequestPart("image") MultipartFile image
    ) {
        PosterResponse response = new PosterResponse(
                1L,
                "https://my-bucket.s3.ap-northeast-2.amazonaws.com/images/2025/09/14/sample-image.png"
        );
        return ResponseEntity.ok(ResponseDto.ok(response));
    }

    @GetMapping(value = "/{posterId}/download")
    @Operation(summary="포스터 다운로드", description="포스터를 선택한 파일 포맷으로 다운로드합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "다운로드 성공"),
            @ApiResponse(responseCode = "500", description = "서버 에러")
    })
    public ResponseEntity<byte[]> download(
            @Parameter(description = "포스터 id", required = true)
            @PathVariable("posterId") Long posterId,
            @Parameter(description = "파일 확장자", required = true)
            @RequestParam("format") PosterDownloadFormat format
    ) {

        // 더미 이미지 bytes 생성
        byte[] bytes = tinyRaster(format.extension);

        String filename = "poster_" + posterId + "." + format.extension;

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(filename).build().toString())
                .contentType(MediaType.parseMediaType(format.contentType))
                .body(bytes);
    }

    /**
     * 더미 이미지 생성 (1x1 px)
     */
    private byte[] tinyRaster(String format) {
        BufferedImage img = new BufferedImage(1, 1, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = img.createGraphics();
        g2d.setColor(Color.WHITE); // 흰색으로 채움
        g2d.fillRect(0, 0, 1, 1);
        g2d.dispose();

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            ImageIO.write(img, format, baos);
            return baos.toByteArray();
        } catch (Exception e) { return new byte[0]; }
    }

    @GetMapping("/group")
    @Operation(summary = "포스터 그룹 목록 조회", description = "포스터 목록을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "500", description = "서버 에러")
    })
    public ResponseEntity<ResponseDto<List<PosterGroupResponse>>> getPosterGroup(
            @Parameter(description = "정렬")
            @RequestParam(value = "order", required = false) PosterListOrder order,
            @Parameter(description = "태그 id")
            @RequestParam(value = "tagId", required = false) Long tagId
    ) {
        List<PosterGroupResponse> list = new ArrayList<>();
        for (long i = 1; i <= 15; i++) {
            PosterGroupResponse group = new PosterGroupResponse(
                    i,
                    "https://dummyimage.com/600x400/000/fff&text=Poster+" + i,
                    "싸피컴퍼니 " + i,
                    "포기는 배추 셀 때나 하는 말" + i,
                    LocalDateTime.now().minusDays(15 - i) // 생성일 임의로 설정
            );
            list.add(group);
        }

        return ResponseEntity.ok(ResponseDto.ok(list));
    }

    @GetMapping("/group/{groupId}")
    @Operation(summary = "특정 포스터 그룹 조회", description = "특정 포스터 그룹을 상세 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "500", description = "서버 에러")
    })
    public ResponseEntity<ResponseDto<PosterGroupResponse>> getPosterGroupDetail(
            @Parameter(description = "포스터 그룹 id", required = true)
            @RequestParam(value = "groupId") Long groupId
    ) {

        List<PosterResponse> history = new ArrayList<>();
        for (long i = 1; i <= 15; i++) {
            PosterResponse poster = new PosterResponse(
                    i,
                    "https://dummyimage.com/600x400/000/fff&text=Poster+" + i,
                    "시들시들한, 연두색 배추 이미지"
            );
            history.add(poster);
        }

        PosterGroupResponse response = new PosterGroupResponse(
                groupId,
                "https://dummyimage.com/600x400/000/fff&text=Poster+0",
                "싸피컴퍼니",
                "포기는 배추 셀 때나 하는 말",
                "아삭아삭한 배추 이미지, 싱싱한 초록색 활용",
                LocalDateTime.now(),
                history
        );

        return ResponseEntity.ok(ResponseDto.ok(response));
    }

    @GetMapping("/tags")
    @Operation(summary = "포스터 태그 목록 조회", description = "포스터 태그 목록을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "500", description = "서버 에러")
    })
    public ResponseEntity<ResponseDto<List<PosterTagResponse>>> getPosterTag(
    ) {

        List<PosterTagResponse> response = new ArrayList<>();
        for (long i = 1; i <= 15; i++) {
            PosterTagResponse tag = new PosterTagResponse(
                    i,
                    "태그 " + i
            );
            response.add(tag);
        }

        return ResponseEntity.ok(ResponseDto.ok(response));
    }

    @PostMapping("/tags")
    @Operation(summary = "포스터 태그 지정", description = "포스터 그룹에 대한 태그를 지정합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "지정 성공"),
            @ApiResponse(responseCode = "500", description = "서버 에러")
    })
    public ResponseEntity<ResponseDto<Void>> createPosterTag(
            @Parameter(description = "포스터 태그 지정", required = true)
            @RequestBody PosterTagRequest request
    ) {
        return ResponseEntity.ok(ResponseDto.ok());
    }
}
