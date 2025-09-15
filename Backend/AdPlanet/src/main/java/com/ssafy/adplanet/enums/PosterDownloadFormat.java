package com.ssafy.adplanet.enums;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "포스터 다운로드 확장자")
public enum PosterDownloadFormat {

    @Schema(description = "png")
    PNG("png","image/png"),

    @Schema(description = "jpg")
    JPEG("jpg","image/jpeg");

    public final String extension;
    public final String contentType;

    PosterDownloadFormat(String extension, String contentType) {
        this.extension = extension;
        this.contentType = contentType;
    }
}
