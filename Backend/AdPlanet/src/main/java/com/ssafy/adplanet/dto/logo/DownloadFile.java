package com.ssafy.adplanet.dto.logo;

public record DownloadFile(
        String filename,
        String contentType,
        byte[] bytes)
{}
