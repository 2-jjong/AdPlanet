package com.ssafy.adplanet.dto.ci;


public final class CiGuidelineDefaults {
    private CiGuidelineDefaults() {}

    public static final String BASIC_LOGO = """
            메인 로고는 워드마크와 심볼을 함께 사용한다.
            가로형과 세로형 버전 두 가지를 제공하며, 사용 환경에 맞게 선택한다.
            """;

    public static final String MIN_SIZE = """
            인쇄용 : 가로 20mm 이상
            디지털용 : 가로 80px 이상
            """;

    public static final String MARGIN_RULE = """
            로고 주위에는 로고 높이의 1/2 이상 여백을 반드시 확보해야 한다.
            """;

    public static final String BACKGROUND_RULE = """
            흰색 또는 브랜드 컬러 배경에서만 사용 권장.
            복잡한 패턴이나 사진 위에서는 흑백 단색 로고를 사용한다.
            """;

    public static final String PROHIBITION_RULE = """
            비율 변경, 색상 임의 변경, 그림자/외곽선 추가 금지, 요소 분리하여 단독 사용 금지
            """;

    public static final String PRIMARY_COLOR   = "#3D9FD8";
    public static final String SECONDARY_COLOR = "#46A9DB";
    public static final String NEUTRAL_COLOR   = "#87DEDA";

    public static final String PRIMARY_GUIDE = """
            Hex
            - #4FB1BA
            RGB
            - (79, 177, 186)
            CMYK
            - (65, 10, 25, 0)
            주 사용처
            - 로고, 주요 버튼, 강조 요소
            """;

    public static final String SECONDARY_GUIDE = """
            Hex
            - #193747
            RGB
            - (25, 55, 71)
            CMYK
            - (90, 65, 50, 40)
            주 사용처
            - 텍스트, 배경, 보조 그래픽
            """;

    public static final String NEUTRAL_GUIDE = """
            Black: #000000
            White: #FFFFFF
            Gray: #CCCCCC
            """;
}
