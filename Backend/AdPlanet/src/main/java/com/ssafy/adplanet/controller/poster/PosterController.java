package com.ssafy.adplanet.controller.poster;

import com.ssafy.adplanet.dto.ResponseDto;
import com.ssafy.adplanet.dto.poster.request.CreatePosterRequest;
import com.ssafy.adplanet.dto.poster.request.EditPosterRequest;
import com.ssafy.adplanet.dto.tag.AssignPosterTagsRequest;
import com.ssafy.adplanet.dto.poster.response.*;
import com.ssafy.adplanet.dto.tag.CreateTagRequest;
import com.ssafy.adplanet.dto.tag.TagDto;
import com.ssafy.adplanet.enums.PosterDownloadFormat;
import com.ssafy.adplanet.enums.PosterListOrder;
import com.ssafy.adplanet.enums.PosterStyle;
import com.ssafy.adplanet.service.poster.PosterService;
import com.ssafy.adplanet.service.tag.TagService;
import com.ssafy.adplanet.util.SecurityUtil;
import io.swagger.v3.oas.annotations.media.Encoding;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/posters")
@Tag(name = "포스터 API", description = "포스터 생성/관리 API")
public class PosterController {

    private final PosterService posterService;
    private final TagService tagService;

    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    @Operation(summary = "포스터 생성 요청", description = "포스터 생성을 요청합니다.")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(
            encoding = @Encoding(name = "request", contentType = MediaType.APPLICATION_JSON_VALUE)))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "요청 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "500", description = "서버 에러")
    })
    public ResponseEntity<ResponseDto<ImageJobResponse>> createPoster(
            @Parameter(description = "포스터 스타일")
            @RequestParam(value = "style", required = false) PosterStyle style,
            @Parameter(description = "요청 정보", required = true)
            @Valid @RequestPart(value = "request") CreatePosterRequest request,
            @Parameter(description = "포즈 이미지")
            @RequestPart(value = "poseImage", required = false) MultipartFile poseImage,
            @Parameter(description = "제품 이미지")
            @RequestPart(value = "productImage", required = false) MultipartFile productImage,
            @Parameter(description = "모델 이미지")
            @RequestPart(value = "modelImage", required = false) MultipartFile modelImage
    ) {

        Long userId = SecurityUtil.getCurrentUserId();

        ImageJobResponse response = posterService.createPoster(userId, style, request, poseImage, productImage, modelImage);

        return ResponseEntity.ok(ResponseDto.ok(response));
    }

    @GetMapping("/jobs/{jobId}")
    @Operation(summary = "포스터 생성 상태 조회", description = "포스터 생성 상태를 조회합니다. 생성 완료 시 결과를 함께 반환합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "500", description = "서버 에러")
    })
    public ResponseEntity<ResponseDto<ImageJobResponse>> getStatus(
            @Parameter(description = "작업 id", required = true)
            @PathVariable("jobId") String jobId
    ) {
        ImageJobResponse response = posterService.getStatus(jobId);

        return ResponseEntity.ok(ResponseDto.ok(response));
    }

    @PostMapping(value = "/{posterId}/edit")
    @Operation(summary = "포스터 수정", description = "포스터 수정을 요청합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "요청 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "500", description = "서버 에러")
    })
    public ResponseEntity<ResponseDto<ImageJobResponse>> editPoster(
            @Parameter(description = "포스터 id", required = true)
            @PathVariable("posterId") Long posterId,
            @Parameter(description = "요청 정보", required = true)
            @Valid @RequestBody EditPosterRequest request
    ) {
        Long userId = SecurityUtil.getCurrentUserId();

        ImageJobResponse response = posterService.editPoster(userId, posterId, request.prompt());

        return ResponseEntity.ok(ResponseDto.ok(response));
    }

    @GetMapping("/{posterId}")
    @Operation(summary = "포스터 단건 조회", description = "포스터를 단건 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "500", description = "서버 에러")
    })
    public ResponseEntity<ResponseDto<PosterResponse>> getPoster(
            @Parameter(description = "포스터 id", required = true)
            @PathVariable("posterId") Long posterId
    ) {
        PosterResponse poster = posterService.getPoster(posterId);

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
        CopyResponse response = posterService.getCopy(posterId);

        return ResponseEntity.ok(ResponseDto.ok(response));
    }

    @PostMapping(value = "/group/{groupId}/save", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    @Operation(summary = "포스터 저장", description = "문구를 포함한 포스터 이미지를 저장합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "저장 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "500", description = "서버 에러")
    })
    public ResponseEntity<ResponseDto<PosterResponse>> createPosterCopy(
            @Parameter(description = "포스터 그룹 id", required = true)
            @PathVariable(value = "groupId") Long groupId,
            @Parameter(description = "이미지", required = true)
            @RequestPart("image") MultipartFile image
    ) {
        PosterResponse response = posterService.saveImage(groupId, image);

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

        byte[] bytes = posterService.downloadPosterImage(posterId);

        String filename = "poster_" + posterId + "." + format.extension;

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(filename).build().toString())
                .contentType(MediaType.parseMediaType(format.contentType))
                .body(bytes);
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
            @RequestParam(value = "tagIds", required = false) List<Long> tagIds
    ) {
        Long userId = SecurityUtil.getCurrentUserId();

        List<PosterGroupResponse> list = posterService.getAllPosterGroup(userId, order, tagIds);

        return ResponseEntity.ok(ResponseDto.ok(list));
    }

    @GetMapping("/group/{groupId}")
    @Operation(summary = "특정 포스터 그룹 조회", description = "특정 포스터 그룹을 상세 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "500", description = "서버 에러")
    })
    public ResponseEntity<ResponseDto<PosterGroupResponse>> getPosterGroupDetail(
            @Parameter(description = "포스터 그룹 id", required = true)
            @PathVariable(value = "groupId") Long groupId
    ) {

        PosterGroupResponse response = posterService.getPosterGroupDetail(groupId);

        return ResponseEntity.ok(ResponseDto.ok(response));
    }

    @GetMapping("/group/{groupId}/processing")
    @Operation(summary = "진행 중인 작업 조회", description = "특정 포스터 그룹 내에 진행 중인 작업을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "500", description = "서버 에러")
    })
    public ResponseEntity<ResponseDto<List<ImageJobResponse>>> getProcessingJobs(
            @Parameter(description = "포스터 그룹 id", required = true)
            @PathVariable(value = "groupId") Long groupId
    ) {
        List<ImageJobResponse> response = posterService.getProgressingJobs(groupId);

        return ResponseEntity.ok(ResponseDto.ok(response));
    }

    @GetMapping("/tags")
    @Operation(summary = "포스터 태그 목록 조회", description = "포스터 태그 목록을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "500", description = "서버 에러")
    })
    public ResponseEntity<ResponseDto<List<TagDto>>> getPosterTag(
    ) {
        Long userId = SecurityUtil.getCurrentUserId();

        List<TagDto> response = tagService.getPosterTags(userId);

        return ResponseEntity.ok(ResponseDto.ok(response));
    }

    @PostMapping("/tags")
    @Operation(summary = "포스터 태그 생성", description = "포스터 태그를 생성합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "500", description = "서버 에러")
    })
    public ResponseEntity<ResponseDto<TagDto>> getTag(
            @Parameter(description = "포스터 태그 생성", required = true)
            @Valid @RequestBody CreateTagRequest request
    ) {

        Long userId = SecurityUtil.getCurrentUserId();

        TagDto response = tagService.createPosterTag(userId, request.name());

        return ResponseEntity.ok(ResponseDto.ok(response));
    }

    @PutMapping("/group/{groupId}/tags")
    @Operation(summary = "포스터 태그 지정", description = "포스터 그룹에 대한 태그를 지정합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "지정 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "500", description = "서버 에러")
    })
    public ResponseEntity<ResponseDto<Void>> createPosterTag(
            @Parameter(description = "포스터 그룹 id", required = true)
            @PathVariable Long groupId,
            @Parameter(description = "포스터 태그 지정", required = true)
            @Valid @RequestBody AssignPosterTagsRequest request
    ) {
        tagService.setPosterTags(groupId, request.tagIds());
        return ResponseEntity.ok(ResponseDto.ok());
    }

    @GetMapping("/{posterId}/image")
    @Operation(summary = "포스터 이미지 조회", description = "포스터 ID로 이미지를 `image/png` 바이너리 형식으로 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "다운로드 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "500", description = "서버 에러")
    })
    public ResponseEntity<byte[]> downloadPosterImage(
            @Parameter(description = "포스터 id", required = true)
            @PathVariable Long posterId
    ) {
        try {
            byte[] imageData = posterService.downloadPosterImage(posterId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_PNG);
            headers.setContentLength(imageData.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(imageData);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(("Error: " + e.getMessage()).getBytes());
        }
    }
}
