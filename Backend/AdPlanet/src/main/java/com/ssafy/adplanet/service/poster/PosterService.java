package com.ssafy.adplanet.service.poster;

import com.ssafy.adplanet.dto.poster.request.CreatePosterRequest;
import com.ssafy.adplanet.dto.poster.response.ImageJobResponse;
import com.ssafy.adplanet.enums.PosterStyle;
import org.springframework.web.multipart.MultipartFile;

public interface PosterService {
    ImageJobResponse create(Long userId, PosterStyle style, CreatePosterRequest request, MultipartFile sketchImage, MultipartFile productImage, MultipartFile modelImage, MultipartFile skeletonImage, MultipartFile previousImage);

    ImageJobResponse getStatus(String jobId);
}
