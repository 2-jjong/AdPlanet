package com.ssafy.adplanet.service.poster;

import com.ssafy.adplanet.dto.poster.request.CreatePosterRequest;
import com.ssafy.adplanet.dto.poster.request.EditPosterJobMessage;
import com.ssafy.adplanet.dto.poster.request.CreatePosterJobMessage;
import com.ssafy.adplanet.dto.poster.response.CopyResponse;
import com.ssafy.adplanet.dto.poster.response.ImageJobResponse;
import com.ssafy.adplanet.dto.poster.response.PosterGroupResponse;
import com.ssafy.adplanet.dto.poster.response.PosterResponse;
import com.ssafy.adplanet.enums.PosterListOrder;
import com.ssafy.adplanet.enums.PosterStyle;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PosterService {
    ImageJobResponse createPoster(Long userId, PosterStyle style, CreatePosterRequest request, MultipartFile backgroundImage, MultipartFile productImage, MultipartFile modelImage);

    ImageJobResponse editPoster(Long userId, Long posterId, String prompt);

    void processCreateJob(CreatePosterJobMessage message) throws Exception;

    void processEditJob(EditPosterJobMessage message) throws Exception;

    ImageJobResponse getStatus(String jobId);

    List<PosterGroupResponse> getAllPosterGroup(Long userId, PosterListOrder order, List<Long> tagIds);

    PosterGroupResponse getPosterGroupDetail(Long groupId);

    PosterResponse getPoster(Long posterId);

    List<ImageJobResponse> getProgressingJobs(Long groupId);

    CopyResponse getCopy(Long posterId);

    PosterResponse saveImage(Long groupId, MultipartFile image);

    byte[] downloadPosterImage(Long posterId);
}
