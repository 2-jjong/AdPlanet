package com.ssafy.adplanet.controller.logo;

import com.ssafy.adplanet.dto.ResponseDto;
import com.ssafy.adplanet.dto.ci.CiGuidelineResponse;
import com.ssafy.adplanet.dto.logo.*;
import com.ssafy.adplanet.enums.LogoListOrder;
import com.ssafy.adplanet.enums.LogoStyle;
import com.ssafy.adplanet.service.ci.CiGuidelineServiceImpl;
import com.ssafy.adplanet.service.logo.LogoService;
import com.ssafy.adplanet.util.SecurityUtil;
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
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/logos")
@Tag(name = "Logo", description = "로고 생성/관리 API")
@RequiredArgsConstructor
public class LogoController {

    private final LogoService logoService;
    private final CiGuidelineServiceImpl ciGuidelineService;

    @PostMapping
    @Operation(summary = "로고 생성", description = "프롬프트를 기반으로 로고를 생성합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })
    public ResponseEntity<ResponseDto<LogoDto>> createLogo(
            @Parameter(
                    in = ParameterIn.QUERY,
                    name = "sytle",
                    description = "로고 스타일 (SIMPLE | MONO). 미지정 시 SIMPLE",
                    schema = @Schema(implementation = LogoStyle.class, allowableValues = {"SIMPLE","MONO"})
            )
            @RequestParam(name = "sytle", required = false, defaultValue = "SIMPLE") LogoStyle style,
            @Parameter(description = "로고 생성 요청 바디", required = true)
            @RequestBody CreateLogoRequest req
    ) {
        try {
            Long userId = SecurityUtil.getCurrentUserId();
            LogoDto dto = logoService.create(userId, req, style);
            return ResponseEntity.ok(ResponseDto.ok(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ResponseDto.error("LG4001", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ResponseDto.error("LG5001", "서버 오류"));
        }
    }

    private String staticUrl(String path) {
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path(path)
                .toUriString();
    }

    @GetMapping
    @Operation(
            summary = "로고 목록 조회",
            description = "정렬(order)과 태그(tagId) 조건으로 로고 목록을 조회합니다. (스켈레톤: 더미 데이터 반환)"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })
    public ResponseEntity<ResponseDto<List<LogoListItem>>> getLogos(
            @RequestParam(defaultValue = "LATEST") LogoListOrder order,
            @RequestParam(required = false) Long tagId
    ) {
        List<LogoListItem> list = new ArrayList<>();
        list.add(new LogoListItem(1L, "싸피컴퍼니", "포기는 배추 셀 때나 하는 말",
                staticUrl("/images/logo_1.png")));
        for (long i = 2; i <= 10; i++) {
            list.add(new LogoListItem(i, "AdPlanet", "로고와 포스터를 한 번에!",
                    staticUrl("/images/logo_2.png")));
        }
        if (order == LogoListOrder.OLDEST) Collections.reverse(list);
        return ResponseEntity.ok(ResponseDto.ok(list));
    }

    @GetMapping("/{logoId}")
    @Operation(
            summary = "로고 상세 조회",
            description = "logoId로 로고 정보를 상세 조회합니다"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })

    public ResponseEntity<ResponseDto<LogoDetail>> getLogoDetail(
//            @Parameter(description = "Bearer 액세스 토큰(문서 표기용)", example = "Bearer eyJhbGciOiJI...")
//            @RequestHeader(name = "Authorization", required = false) String authorization,
            @Parameter(description = "로고 ID", example = "1")
            @PathVariable Long logoId
    ) {
        if (logoId == null || logoId <= 0) {
            return ResponseEntity.badRequest()
                    .body(new ResponseDto<>("LG4001", null, "logoId가 유효하지 않습니다."));
        }

        LogoDetail detail = new LogoDetail(
                "싸피컴퍼니",
                "포기는 배추 셀 때나 하는 말",
                "images/logo_1",
                "아삭아삭한 배추 이미지, 싱싱한 초록색 활용"
        );

        return ResponseEntity.ok(new ResponseDto<>("S0000", detail, null));
    }

    @GetMapping("/tags")
    @Operation(
            summary = "로고 태그 목록 조회",
            description = "로고에 사용 가능한 태그 목록을 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })
    public ResponseEntity<ResponseDto<List<LogoTagItem>>> getLogoTags() {
        var list = List.of(
                new LogoTagItem(1L, "자연적인"),
                new LogoTagItem(2L, "미니멀")
        );
        return ResponseEntity.ok(new ResponseDto<>("S0000", list, null));
    }

    @PostMapping("/tags")
    @Operation(
            summary = "로고 태그 지정",
            description = "logoId에 tagName을 지정합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })
    public ResponseEntity<ResponseDto<Void>> assignLogoTag (
            @RequestBody LogoTagAssignRequest req
    ) {
        return ResponseEntity.ok(new ResponseDto<>("S0000", null, null));
    }

    @PostMapping("/{logoId}/ci-guideline")
    @Operation(
            summary = "CI 가이드라인 생성",
            description = "logoId에 대해 CI(브랜드) 가이드라인을 생성합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })
    public ResponseEntity<ResponseDto<CiGuidelineResponse>> generateCiGuide (
            @Parameter(description = "로고 ID", example = "1")
            @PathVariable Long logoId
    ) {
        try {
            var resp = ciGuidelineService.createWithImageAi(logoId);
            return ResponseEntity.ok(ResponseDto.ok(resp));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ResponseDto.error("LG4000", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ResponseDto.error("LG4091", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ResponseDto.error("LG5000", "서버 오류"));
        }

    }

    @GetMapping("/{logoId}/ci-guideline")
    @Operation(summary = "CI 가이드라인 조회", description = "logoId로 저장된 CI(브랜드) 가이드를 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "404", description = "데이터 없음")
    })
    public ResponseEntity<ResponseDto<CiGuidelineResponse>> getCiGuide(
            @PathVariable Long logoId
    ) {
        try {
            var opt = ciGuidelineService.getByLogoId(logoId);
            if (opt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ResponseDto.error("LG4000", "해당 로고의 CI 가이드라인이 없습니다."));
            }
            return ResponseEntity.ok(ResponseDto.ok(opt.get()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ResponseDto.error("LG4002", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ResponseDto.error("LG5000", "서버 오류"));
        }
    }

    @GetMapping(value = "/{logoId}/download")
    @Operation(
            summary="로고 다운로드",
            description="logoId의 로고 파일을 지정한 형식(png/jpg/svg)으로 다운로드합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })
    public ResponseEntity<byte[]> download(
            @PathVariable Long logoId,
            @RequestParam(defaultValue = "png") String format
    ) {
        String f = format == null ? "png" : format.trim().toLowerCase();
        String contentType;
        byte[] bytes;

        switch (f) {
            case "jpg":
            case "jpeg":
                contentType = "image/jpeg";
                bytes = tinyRaster("jpg"); // 1x1 더미 JPG
                break;
            case "svg":
                contentType = "image/svg+xml";
                bytes = tinySvg(logoId).getBytes(StandardCharsets.UTF_8); // 더미 SVG
                break;
            default:
                contentType = "image/png";
                bytes = tinyRaster("png"); // 1x1 더미 PNG
        }

        String ext = (f.equals("jpg") || f.equals("jpeg")) ? "jpg" : (f.equals("svg") ? "svg" : "png");
        String filename = "logo_" + logoId + "." + ext;

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(filename).build().toString())
                .contentType(MediaType.parseMediaType(contentType))
                .body(bytes);
    }

    // ---- 아래는 최소 더미 생성 유틸 (1x1 흰색) ----
    private byte[] tinyRaster(String fmt) {
        try {
            BufferedImage img = new BufferedImage(1, 1, BufferedImage.TYPE_INT_RGB);
            img.setRGB(0, 0, 0xFFFFFF); // 흰색
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(img, fmt.equals("jpg") ? "jpg" : "png", baos);
            return baos.toByteArray();
        } catch (Exception e) { return new byte[0]; }
    }

    private String tinySvg(Long id) {
        return """
            <svg xmlns="http://www.w3.org/2000/svg" width="1" height="1">
              <rect width="1" height="1" fill="#FFFFFF"/>
            </svg>
            """;
    }
}
