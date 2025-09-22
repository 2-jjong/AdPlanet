package com.ssafy.adplanet.service.poster;

import com.ssafy.adplanet.dto.poster.request.CreatePosterRequest;
import com.ssafy.adplanet.dto.poster.request.ImageJobMessage;
import com.ssafy.adplanet.dto.poster.response.ImageJobResponse;
import com.ssafy.adplanet.dto.poster.response.PosterGroupResponse;
import com.ssafy.adplanet.dto.poster.response.PosterResponse;
import com.ssafy.adplanet.enums.PosterListOrder;
import com.ssafy.adplanet.enums.PosterStyle;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PosterService {
    ImageJobResponse create(Long userId, PosterStyle style, CreatePosterRequest request, MultipartFile sketchImage, MultipartFile productImage, MultipartFile modelImage, MultipartFile skeletonImage, MultipartFile previousImage);

    void processJob(ImageJobMessage message) throws Exception;

    ImageJobResponse getStatus(String jobId);

    List<PosterGroupResponse> getPosterGroup(Long userId, PosterListOrder order, List<Long> tagIds);

    PosterGroupResponse getPosterGroupDetail(Long groupId);

    PosterResponse getPoster(Long posterId);

    List<ImageJobResponse> getProgressingJobs(Long groupId);
}
