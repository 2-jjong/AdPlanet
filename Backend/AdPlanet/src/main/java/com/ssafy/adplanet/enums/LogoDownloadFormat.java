package com.ssafy.adplanet.enums;

public enum LogoDownloadFormat {
    PNG("png","image/png"),
    JPEG("jpg","image/jpeg"),
    SVG("svg","image/svg+xml");
    public final String ext; public final String contentType;
    LogoDownloadFormat(String e,String c){ this.ext=e; this.contentType=c; }
    public static LogoDownloadFormat from(String s){
        String v = s==null? "": s.trim().toLowerCase();
        if (v.equals("png")) return PNG;
        if (v.equals("jpg")||v.equals("jpeg")) return JPEG;
        if (v.equals("svg")) return SVG;
        throw new IllegalArgumentException("unsupported format: "+s);
    }
}
