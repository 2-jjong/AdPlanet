package com.ssafy.adplanet.enums;

public enum ImageFormat {
    PNG("png", "image/png"),
    JPG("jpg", "image/jpeg"),
    JPEG("jpeg", "image/jpeg"),
    SVG("svg", "image/svg+xml");

    public final String ext;
    public final String contentType;

    ImageFormat(String ext, String contentType) {
        this.ext = ext;
        this.contentType = contentType;
    }

    // ✅ 추가
    public boolean isJpegLike() {
        return this == JPG || this == JPEG;
    }

    public static ImageFormat from(String s) {
        if (s == null) return PNG;
        return ImageFormat.valueOf(s.trim().toUpperCase());
    }
}
