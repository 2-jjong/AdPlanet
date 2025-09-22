package com.ssafy.adplanet.service.tag;

import com.ssafy.adplanet.dto.tag.TagDto;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface TagService {
    TagDto create(String tagName);
    List<TagDto> search(String tagName);
    List<TagDto> setLogoTags(Long logoId, List<Long> tagIds);
    List<TagDto> getLogoTags(Long logoId);
    TagDto createPosterTag(Long userId, String tagName);
    void setPosterTags(Long groupId, List<Long> tagIds);
}
