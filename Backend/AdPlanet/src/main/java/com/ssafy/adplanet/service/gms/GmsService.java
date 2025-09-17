package com.ssafy.adplanet.service.gms;

public interface GmsService {
    PalettePayload generatePaletteByImage(String brandName, String slogan, String imageUrl);

    @lombok.Data
    class PalettePayload {
        private String primaryColor;
        private String secondaryColor;
        private String neutralColor;
        private String primaryGuide;
        private String secondaryGuide;
        private String neutralGuide;
    }
}
