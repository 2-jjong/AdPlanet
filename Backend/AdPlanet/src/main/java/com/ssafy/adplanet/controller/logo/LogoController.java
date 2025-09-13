package com.ssafy.adplanet.controller.logo;

import com.ssafy.adplanet.dto.ResponseDto;
import com.ssafy.adplanet.dto.logo.CreateLogoRequest;
import com.ssafy.adplanet.dto.logo.LogoDetail;
import com.ssafy.adplanet.dto.logo.LogoDto;
import com.ssafy.adplanet.dto.logo.LogoListItem;
import com.ssafy.adplanet.enums.LogoListOrder;
import com.ssafy.adplanet.service.LogoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/logos")
@Tag(name = "Logo", description = "로고 생성/관리 API")
@RequiredArgsConstructor
public class LogoController {

    private final LogoService logoService;

    @PostMapping
    @Operation(
            summary = "로고 생성",
            description = "프롬프트를 기반으로 로고를 생성합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })
    public ResponseEntity<ResponseDto<LogoDto>> createLogo(
            @Parameter(description = "로고 생성 요청 바디", required = true)
            @RequestBody CreateLogoRequest req
    ) {
//        try {
//            LogoDto dto = logoService.create(1L, req);
//            return ResponseEntity.ok(ApiResponse.ok(dto));
//        } catch (IllegalArgumentException e) {
//            return ResponseEntity.badRequest().body(ApiResponse.error("LG4001", e.getMessage()));
//        }
        LogoDto dto = new LogoDto(1L, "image/logo_");
        // 인위적으로 7초 기다렸다가 응답
        try {
            TimeUnit.SECONDS.sleep(7);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return ResponseEntity.ok(ResponseDto.ok(dto));
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
    public ResponseEntity<ResponseDto<List<LogoListItem>>> getLogos (
//            @Parameter(description = "Bearer 액세스 토큰(문서용)") @RequestHeader(name = "Authorization", required = false) String authorization,
            @RequestParam(name = "order", required = false, defaultValue = "LATEST") LogoListOrder order,
            @Parameter(description = "태그 ID", example = "1")
            @RequestParam(name = "tagId", required = false) Long tagId
    ) {
        List<LogoListItem> list = new ArrayList<>();
        list.add(new LogoListItem(1L, "싸피컴퍼니", "포기는 배추 셀 때나 하는 말", "/images/logo_1"));
        list.add(new LogoListItem(2L, "AdPlanet", "로고와 포스터를 한 번에!", "/images/logo_2"));

        if (order == LogoListOrder.OLDEST) {
            Collections.reverse(list);
        }

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
}
