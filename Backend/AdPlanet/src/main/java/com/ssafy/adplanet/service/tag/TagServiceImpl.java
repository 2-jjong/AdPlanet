package com.ssafy.adplanet.service.tag;

import com.ssafy.adplanet.dto.tag.TagDto;
import com.ssafy.adplanet.entity.Logo;
import com.ssafy.adplanet.entity.Tag;
import com.ssafy.adplanet.repository.LogoRepository;
import com.ssafy.adplanet.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {

    private final TagRepository tagRepository;
    private final LogoRepository logoRepository;

    @Override
    @Transactional
    public TagDto create(String tagName) {
        String name = normalize(tagName);
        if (name.isEmpty()) throw new IllegalArgumentException("태그명을 입력하세요.");
        // 중복 방지
        tagRepository.findByNameIgnoreCase(name).ifPresent(t -> {
            throw new IllegalArgumentException("이미 존재하는 태그입니다: " + name);
        });
        Tag saved = tagRepository.save(Tag.builder().name(name).build());
        return new TagDto(saved.getId(), saved.getName());
    }

    @Override
    @Transactional
    public List<TagDto> setTags(Long logoId, List<Long> tagIds) {
        if (tagIds == null) {
            throw new IllegalArgumentException("tagIds가 비어 있습니다.");
        }

        Logo logo = logoRepository.findById(logoId)
                .orElseThrow(() -> new NoSuchElementException("로고가 없습니다: " + logoId));

        Set<Long> uniqueIds = new HashSet<>(tagIds);

        List<Tag> tags = uniqueIds.isEmpty()
                ? List.of()
                : tagRepository.findAllById(uniqueIds);

        if (tags.size() != uniqueIds.size()) {
            throw new NoSuchElementException("존재하지 않는 tagId가 포함되어 있습니다.");
        }

        logo.setTags(tags);

        return tags.stream()
                .map(t -> new TagDto(t.getId(), t.getName()))
                .toList();
    }


    @Override
    @Transactional(readOnly = true)
    public List<TagDto> search(String q) {
        String keyword = q == null ? "" : q.trim();

        List<Tag> tags = keyword.isEmpty()
                ? tagRepository.findAllByOrderByNameAsc()
                : tagRepository.findByNameContainingIgnoreCaseOrderByNameAsc(keyword);

        return tags.stream()
                .map(t -> new TagDto(t.getId(), t.getName()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TagDto> getTags(Long logoId) {
        Logo logo = logoRepository.findById(logoId)
                .orElseThrow(() -> new NoSuchElementException("로고가 없습니다: " + logoId));
        return logo.getTags().stream()
                .map(t -> new TagDto(t.getId(), t.getName()))
                .toList();
    }

    private String normalize(String s) { return s == null ? "" : s.trim(); }
}
