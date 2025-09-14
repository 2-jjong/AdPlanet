package com.ssafy.adplanet.enums;

public enum PosterDownloadFormat {
    PNG("png","image/png"),
    JPEG("jpg","image/jpeg");

    public final String extension;
    public final String contentType;

    PosterDownloadFormat(String e, String c) { this.extension = e; this.contentType = c; }
}
