package com.ssafy.adplanet.service.watermark;

import com.ssafy.adplanet.dto.watermark.WatermarkDetectionResponse;
import org.springframework.web.multipart.MultipartFile;

public interface WatermarkService {

    byte[] insertWatermark(MultipartFile imageFile, String creator, String content) throws Exception;

    WatermarkDetectionResponse detectWatermark(MultipartFile imageFile) throws Exception;
}