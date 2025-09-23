package com.ssafy.adplanet.service.watermark;

import com.ssafy.adplanet.dto.watermark.WatermarkDetectionResponse;
import com.ssafy.adplanet.exception.BusinessException;
import com.ssafy.adplanet.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class WatermarkServiceImpl implements WatermarkService {

    // 데이터의 끝을 식별하기 위한 구분자
    private static final String END_MARKER = "1111111111111110";

    @Override
    public byte[] insertWatermark(MultipartFile imageFile, String creator, String content) {
        try {
            if (creator == null || creator.trim().isEmpty()) {
                throw new BusinessException(ErrorCode.WATERMARK_CREATOR_EMPTY);
            }
            if (content == null || content.trim().isEmpty()) {
                throw new BusinessException(ErrorCode.WATERMARK_CONTENT_EMPTY);
            }

            String watermarkText = "제작자: " + creator.trim() + " 내용: " + content.trim();
            log.debug("워터마크 삽입 시작 - 제작자: '{}', 내용: '{}', 전체텍스트길이: {}자",
                    creator, content, watermarkText.length());

            if (imageFile.isEmpty()) {
                throw new BusinessException(ErrorCode.WATERMARK_EMPTY_FILE);
            }

            BufferedImage originalImage = ImageIO.read(imageFile.getInputStream());
            if (originalImage == null) {
                throw new BusinessException(ErrorCode.WATERMARK_INVALID_IMAGE_FORMAT);
            }

            log.debug("이미지 로드 완료 - 크기: {}x{}, 타입: {}",
                    originalImage.getWidth(), originalImage.getHeight(), originalImage.getType());

            BufferedImage watermarkedImage = insertWatermarkToImage(originalImage, watermarkText);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(watermarkedImage, "png", baos);
            byte[] result = baos.toByteArray();

            log.debug("워터마크 삽입 완료 - 결과파일크기: {}bytes", result.length);
            return result;

        } catch (BusinessException e) {
            log.error("워터마크 삽입 실패: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("워터마크 삽입 중 오류 발생", e);
            throw new BusinessException(ErrorCode.WATERMARK_INSERTION_FAILED, e);
        }
    }

    @Override
    public byte[] insertWatermark(byte[] imageBytes, String creator, String content) {
        try {
            if (creator == null || creator.trim().isEmpty()) {
                throw new BusinessException(ErrorCode.WATERMARK_CREATOR_EMPTY);
            }
            if (content == null || content.trim().isEmpty()) {
                throw new BusinessException(ErrorCode.WATERMARK_CONTENT_EMPTY);
            }

            String watermarkText = "제작자: " + creator.trim() + " 내용: " + content.trim();
            log.debug("워터마크 삽입 시작 - 제작자: '{}', 내용: '{}', 전체텍스트길이: {}자",
                    creator, content, watermarkText.length());

            if (imageBytes == null || imageBytes.length == 0) {
                throw new BusinessException(ErrorCode.WATERMARK_EMPTY_FILE);
            }

            BufferedImage originalImage = ImageIO.read(new ByteArrayInputStream(imageBytes));
            if (originalImage == null) {
                throw new BusinessException(ErrorCode.WATERMARK_INVALID_IMAGE_FORMAT);
            }

            log.debug("이미지 로드 완료 - 크기: {}x{}, 타입: {}",
                    originalImage.getWidth(), originalImage.getHeight(), originalImage.getType());

            BufferedImage watermarkedImage = insertWatermarkToImage(originalImage, watermarkText);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(watermarkedImage, "png", baos);
            byte[] result = baos.toByteArray();

            log.debug("워터마크 삽입 완료 - 결과파일크기: {}bytes", result.length);
            return result;

        } catch (BusinessException e) {
            log.error("워터마크 삽입 실패: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("워터마크 삽입 중 오류 발생", e);
            throw new BusinessException(ErrorCode.WATERMARK_INSERTION_FAILED, e);
        }
    }

    @Override
    public WatermarkDetectionResponse detectWatermark(MultipartFile imageFile) {
        try {
            log.debug("워터마크 검출 시작");

            if (imageFile.isEmpty()) {
                throw new BusinessException(ErrorCode.WATERMARK_EMPTY_FILE);
            }

            BufferedImage image = ImageIO.read(imageFile.getInputStream());
            if (image == null) {
                throw new BusinessException(ErrorCode.WATERMARK_INVALID_IMAGE_FORMAT);
            }

            log.debug("이미지 로드 완료 - 크기: {}x{}, 타입: {}",
                    image.getWidth(), image.getHeight(), image.getType());

            String extractedText = detectWatermarkFromImage(image);

            if (extractedText == null || extractedText.equals("워터마크를 찾을 수 없습니다.")) {
                log.debug("워터마크 검출 실패");
                throw new BusinessException(ErrorCode.WATERMARK_NOT_DETECTED);
            }

            WatermarkDetectionResponse result = parseWatermarkText(extractedText);
            log.debug("워터마크 검출 완료 - 제작자: '{}', 내용: '{}'",
                    result.creator(), result.content());

            return result;

        } catch (BusinessException e) {
            log.error("워터마크 검출 실패: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("워터마크 검출 중 오류 발생", e);
            throw new BusinessException(ErrorCode.WATERMARK_DETECTION_FAILED, e);
        }
    }

    private WatermarkDetectionResponse parseWatermarkText(String watermarkText) {
        log.debug("워터마크 텍스트 파싱 시작 - 원본: '{}'", watermarkText);

        // 정규식으로 "제작자: XXX 내용: XXX" 형식 파싱
        Pattern pattern = Pattern.compile("제작자:\\s*(.+?)\\s+내용:\\s*(.+)");
        Matcher matcher = pattern.matcher(watermarkText);

        if (matcher.find()) {
            String creator = matcher.group(1).trim();
            String content = matcher.group(2).trim();
            log.debug("워터마크 파싱 성공 - 제작자: '{}', 내용: '{}'", creator, content);
            return new WatermarkDetectionResponse(creator, content);
        } else {
            log.debug("워터마크 파싱 실패 - 형식이 맞지 않음");
            // 형식이 맞지 않으면 전체 텍스트를 내용으로 처리
            return new WatermarkDetectionResponse("알 수 없음", watermarkText);
        }
    }

    private BufferedImage insertWatermarkToImage(BufferedImage originalImage, String watermarkText) {
        log.debug("LSB 워터마크 삽입 시작 - 이미지크기: {}x{}",
                originalImage.getWidth(), originalImage.getHeight());

        BufferedImage watermarkedImage = new BufferedImage(
                originalImage.getWidth(),
                originalImage.getHeight(),
                BufferedImage.TYPE_INT_RGB
        );
        watermarkedImage.getGraphics().drawImage(originalImage, 0, 0, null);

        // 텍스트를 UTF-8 바이트로 변환한 후 바이너리로 변환
        StringBuilder binaryWatermark = new StringBuilder();
        try {
            byte[] utf8Bytes = watermarkText.getBytes("UTF-8");
            log.debug("UTF-8 인코딩 성공 - 바이트수: {}", utf8Bytes.length);
            for (byte b : utf8Bytes) {
                String binary = Integer.toBinaryString(b & 0xFF);
                binaryWatermark.append(String.format("%8s", binary).replace(' ', '0'));
            }
        } catch (Exception e) {
            log.debug("UTF-8 인코딩 실패, 기본 방식 사용 - 문자수: {}", watermarkText.length());
            for (char c : watermarkText.toCharArray()) {
                String binary = Integer.toBinaryString(c);
                binaryWatermark.append(String.format("%16s", binary).replace(' ', '0'));
            }
        }
        binaryWatermark.append(END_MARKER);

        log.debug("워터마크 바이너리 생성 완료 - 총비트수: {}bits", binaryWatermark.length());

        int width = watermarkedImage.getWidth();
        int height = watermarkedImage.getHeight();
        int bitIndex = 0;

        // 픽셀의 RGB 값에서 각 R, G, B 3 채널의 최하위 비트를 변경
        outerLoop:
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                if (bitIndex >= binaryWatermark.length()) {
                    break outerLoop;
                }

                int rgb = watermarkedImage.getRGB(x, y);
                int red = (rgb >> 16) & 0xFF;
                int green = (rgb >> 8) & 0xFF;
                int blue = rgb & 0xFF;

                if (bitIndex < binaryWatermark.length()) {
                    red = (red & 0xFE) | Character.getNumericValue(binaryWatermark.charAt(bitIndex++));
                }
                if (bitIndex < binaryWatermark.length()) {
                    green = (green & 0xFE) | Character.getNumericValue(binaryWatermark.charAt(bitIndex++));
                }
                if (bitIndex < binaryWatermark.length()) {
                    blue = (blue & 0xFE) | Character.getNumericValue(binaryWatermark.charAt(bitIndex++));
                }

                int newRgb = (red << 16) | (green << 8) | blue;
                watermarkedImage.setRGB(x, y, newRgb);
            }
        }

        log.debug("LSB 워터마크 삽입 완료 - 삽입된비트수: {}/{}", bitIndex, binaryWatermark.length());
        return watermarkedImage;
    }

    private String detectWatermarkFromImage(BufferedImage watermarkedImage) {
        log.debug("LSB 워터마크 추출 시작 - 이미지크기: {}x{}",
                watermarkedImage.getWidth(), watermarkedImage.getHeight());

        StringBuilder binaryData = new StringBuilder();
        int width = watermarkedImage.getWidth();
        int height = watermarkedImage.getHeight();

        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                int rgb = watermarkedImage.getRGB(x, y);
                int red = (rgb >> 16) & 0xFF;
                int green = (rgb >> 8) & 0xFF;
                int blue = rgb & 0xFF;

                binaryData.append(red & 1);
                binaryData.append(green & 1);
                binaryData.append(blue & 1);
            }
        }

        log.debug("바이너리 데이터 추출 완료 - 총비트수: {}bits", binaryData.length());

        String binaryString = binaryData.toString();
        int endIndex = binaryString.indexOf(END_MARKER);
        if (endIndex == -1) {
            log.debug("종료 마커를 찾을 수 없음 - 워터마크 없음");
            return "워터마크를 찾을 수 없습니다.";
        }

        log.debug("종료 마커 발견 - 위치: {}, 워터마크 비트수: {}bits", endIndex, endIndex);

        String watermarkBinary = binaryString.substring(0, endIndex);

        try {
            int byteCount = watermarkBinary.length() / 8;
            byte[] bytes = new byte[byteCount];

            log.debug("UTF-8 디코딩 시도 - 바이트수: {}", byteCount);

            for (int i = 0; i < byteCount; i++) {
                String byteString = watermarkBinary.substring(i * 8, (i + 1) * 8);
                bytes[i] = (byte) Integer.parseInt(byteString, 2);
            }

            String result = new String(bytes, "UTF-8");
            log.debug("UTF-8 디코딩 성공 - 추출된 텍스트: '{}'", result);
            return result;

        } catch (Exception e) {
            log.debug("UTF-8 디코딩 실패, 기본 방식으로 재시도: {}", e.getMessage());

            StringBuilder watermark = new StringBuilder();
            for (int i = 0; i < watermarkBinary.length(); i += 16) {
                if (i + 16 <= watermarkBinary.length()) {
                    String charString = watermarkBinary.substring(i, i + 16);
                    int charCode = Integer.parseInt(charString, 2);
                    watermark.append((char) charCode);
                }
            }

            String result = watermark.toString();
            log.debug("기본 방식 디코딩 완료 - 추출된 텍스트: '{}'", result);
            return result;
        }
    }
}