package com.ssafy.adplanet.controller.logo;

import com.ssafy.adplanet.dto.ResponseDto;
import com.ssafy.adplanet.dto.ci.CiGuidelineResponse;
import com.ssafy.adplanet.dto.logo.*;
import com.ssafy.adplanet.dto.tag.AssignLogoTagsRequest;
import com.ssafy.adplanet.dto.tag.CreateTagRequest;
import com.ssafy.adplanet.dto.tag.TagDto;
import com.ssafy.adplanet.enums.LogoListOrder;
import com.ssafy.adplanet.enums.LogoStyle;
import com.ssafy.adplanet.service.ci.CiGuidelineServiceImpl;
import com.ssafy.adplanet.service.logo.LogoService;
import com.ssafy.adplanet.util.SecurityUtil;
import com.ssafy.adplanet.service.tag.TagService;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/logos")
@Tag(name = "Logo", description = "로고 생성/관리 API")
@RequiredArgsConstructor
public class LogoController {

    private final LogoService logoService;
    private final CiGuidelineServiceImpl ciGuidelineService;
    private final TagService tagService;

    @PostMapping
    @Operation(summary = "로고 생성", description = "프롬프트를 기반으로 로고를 생성합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })
    public ResponseEntity<ResponseDto<LogoDto>> createLogo(
            @Parameter(
                    in = ParameterIn.QUERY,
                    name = "style",
                    description = "로고 스타일 (SIMPLE | MONO). 미지정 시 SIMPLE",
                    schema = @Schema(implementation = LogoStyle.class, allowableValues = {"SIMPLE","MONO"})
            )
            @RequestParam(name = "style", required = false, defaultValue = "SIMPLE") LogoStyle style,
            @Parameter(description = "로고 생성 요청 바디", required = true)
            @RequestBody CreateLogoRequest req
    ) {
        Long userId = SecurityUtil.getCurrentUserId();
        LogoDto dto = logoService.createLogo(userId, req, style);
        return ResponseEntity.ok(ResponseDto.ok(dto));
    }

    @GetMapping
    @Operation(
            summary = "로고 목록 조회",
            description = "정렬(order)과 태그(tagIds) 조건으로 로고 목록을 조회합니다. 태그 미선택 시 전체 반환."
    )
    @ApiResponse(responseCode = "200", description = "조회 성공")
    public ResponseEntity<ResponseDto<List<LogoListItem>>> getLogos(
            @Parameter(description = "정렬 기준 (기본값=NEWEST)")
            @RequestParam(name = "order", required = false, defaultValue = "NEWEST")
            LogoListOrder order,

            @Parameter(description = "다중 태그 id 목록 (CSV/반복 파라미터 모두 허용). 예: 1,2,3 또는 tagIds=1&tagIds=2")
            @RequestParam(name = "tagIds", required = false)
            List<Long> tagIds
    ) {
        Long userId = SecurityUtil.getCurrentUserId();
        List<LogoListItem> data = logoService.getLogoList(userId, tagIds, order);
        return ResponseEntity.ok(ResponseDto.ok(data));
    }

    @GetMapping("/{logoId}")
    @Operation(summary = "로고 상세 조회", description = "logoId로 로고 정보를 상세 조회합니다")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })
    public ResponseEntity<ResponseDto<LogoDetail>> getLogoDetail(
            @Parameter(description = "로고 ID", example = "1")
            @PathVariable Long logoId
    ) {
        long userId = SecurityUtil.getCurrentUserId();
        LogoDetail detail = logoService.getLogoDetail(userId, logoId);
        return ResponseEntity.ok(ResponseDto.ok(detail));
    }

    @GetMapping("/tags")
    @Operation(summary = "로고 태그 목록 조회", description = "로고에 사용 가능한 태그 목록을 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })
    public ResponseEntity<ResponseDto<List<TagDto>>> getLogoTags() {
        var list = tagService.search(null);
        return ResponseEntity.ok(ResponseDto.ok(list));
    }

    @PostMapping("/tags")
    @Operation(summary = "태그 생성(단일)", description = "새 태그를 1개 생성하고 {id, name}을 반환합니다. 중복 이름은 400")
    public ResponseEntity<ResponseDto<TagDto>> createTag(@RequestBody CreateTagRequest req) {
        TagDto dto = tagService.create(req.name());
        return ResponseEntity.ok(ResponseDto.ok(dto));
    }

    @PutMapping("/{logoId}/tags")
    @Operation(summary = "로고 태그 부여", description = "로고 생성 이후, tagIds 목록으로 로고의 태그를 설정합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })
    public ResponseEntity<ResponseDto<List<TagDto>>> assignTagsToLogo(
            @PathVariable Long logoId,
            @RequestBody AssignLogoTagsRequest req
    ) {
        var result = tagService.setLogoTags(logoId, req.tagIds());
        return ResponseEntity.ok(ResponseDto.ok(result));
    }

    @PostMapping("/{logoId}/ci-guideline")
    @Operation(summary = "CI 가이드라인 생성", description = "logoId에 대해 CI(브랜드) 가이드라인을 생성합니다.")
    public ResponseEntity<ResponseDto<CiGuidelineResponse>> generateCiGuide(
            @Parameter(description = "로고 ID", example = "1")
            @PathVariable Long logoId
    ) {
        var resp = ciGuidelineService.createWithImageAi(logoId);
        return ResponseEntity.ok(ResponseDto.ok(resp));
    }

    @GetMapping("/{logoId}/ci-guideline")
    @Operation(summary = "CI 가이드라인 조회", description = "logoId로 저장된 CI(브랜드) 가이드를 조회합니다.")
    public ResponseEntity<ResponseDto<CiGuidelineResponse>> getCiGuide(@PathVariable Long logoId) {
        var opt = ciGuidelineService.getByLogoId(logoId);
        if (opt.isEmpty()) {
            // 팀 규칙대로라면 여기서도 BusinessException(LOGO_NOT_FOUND)로 던져 전역 400 처리도 가능
            return ResponseEntity.badRequest()
                    .body(ResponseDto.error("LG4040", "해당 로고의 CI 가이드라인이 없습니다."));
        }
        return ResponseEntity.ok(ResponseDto.ok(opt.get()));
    }

    @GetMapping(value = "/{logoId}/download")
    @Operation(summary="로고 다운로드", description="logoId의 로고 파일을 지정한 형식(png/jpg/svg)으로 다운로드합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })
    public ResponseEntity<byte[]> downloadLogo(
            @Parameter(description = "로고 id", required = true)
            @PathVariable("logoId") Long logoId
    ) {
        Long userId = SecurityUtil.getCurrentUserId();

        byte[] bytes = logoService.downloadLogoImage(userId, logoId);

        // 파일명: logo_{id}.png  (한글 제목 쓰고 싶으면 아래 주석 참고)
        String filename = "logo_" + logoId + ".png";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(filename /*, StandardCharsets.UTF_8*/) // 한글 파일명 필요 시 주석 해제
                                .build().toString())
                .contentType(MediaType.parseMediaType("image/png"))
                .body(bytes);
    }
}
