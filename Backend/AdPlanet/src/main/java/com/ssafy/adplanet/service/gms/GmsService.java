package com.ssafy.adplanet.service.gms;

import lombok.Data;

public interface GmsService {
    PalettePayload generatePaletteByImage(String brandName, String slogan, String imageUrl);

    @Data
    class PalettePayload {
        private String primaryColor;
        private String secondaryColor;
        private String neutralColor;

        private ColorGuide primaryGuide;
        private ColorGuide secondaryGuide;

        private String neutralGuide;

        @Data
        public static class ColorGuide {
            private String hex;         // "#RRGGBB"
            private String rgb;         // "R, G, B"
            private String CMYK;        // "C, M, Y, K"  (대문자 키 유지)
            private String mainUsage;   // "주 사용처"
        }
    }
}
