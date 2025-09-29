package com.ssafy.adplanet.service.tag;

import com.ssafy.adplanet.dto.tag.TagDto;
import com.ssafy.adplanet.entity.Logo;
import com.ssafy.adplanet.entity.PosterGroup;
import com.ssafy.adplanet.entity.Tag;
import com.ssafy.adplanet.exception.BusinessException;
import com.ssafy.adplanet.exception.ErrorCode;
import com.ssafy.adplanet.repository.LogoRepository;
import com.ssafy.adplanet.repository.PosterGroupRepository;
import com.ssafy.adplanet.repository.TagRepository;
import com.ssafy.adplanet.service.poster.MessageListener;
import com.ssafy.adplanet.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {

    private final TagRepository tagRepository;
    private final LogoRepository logoRepository;
    private final PosterGroupRepository posterGroupRepository;

    private static final Logger log = LoggerFactory.getLogger(MessageListener.class);

    @Override
    @Transactional
    public TagDto create(String tagName) {

        String name = normalize(tagName);
        if (name.isEmpty()) throw new IllegalArgumentException("태그명을 입력하세요.");

        tagRepository.findByNameIgnoreCase(name).ifPresent(t -> {
            throw new IllegalArgumentException("이미 존재하는 태그입니다: " + name);
        });

        Tag saved = tagRepository.save(Tag.builder().name(name).build());

        return new TagDto(saved.getId(), saved.getName());
    }

    @Override
    @Transactional
    public List<TagDto> setLogoTags(Long logoId, List<Long> tagIds) {
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
        Long userId = SecurityUtil.getCurrentUserId();
        String keyword = normalize(q);

        List<Tag> tags = (keyword.isEmpty())
                ? tagRepository.findDistinctByUserId(userId)
                : tagRepository.findDistinctByUserIdAndKeyword(userId, keyword);

        return tags.stream()
                .map(t -> new TagDto(t.getId(), t.getName()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TagDto> getLogoTags(Long logoId) {
        Logo logo = logoRepository.findById(logoId)
                .orElseThrow(() -> new NoSuchElementException("로고가 없습니다: " + logoId));
        return logo.getTags().stream()
                .map(t -> new TagDto(t.getId(), t.getName()))
                .toList();
    }

    private String normalize(String s) {
        return s == null ? "" : s.trim();
    }

    @Override
    @Transactional
    public TagDto createPosterTag(Long userId, String tagName) {

        // 0. 태그명 정규화
        String name = normalize(tagName);
        if (name.isEmpty()) throw new IllegalArgumentException("태그명을 입력하세요.");
        log.info("[TAG-CREATE] 태그명 정규화: {}", name);

        // 1. 유저의 포스터 그룹 중 해당 태그 존재 여부 확인
        boolean tagExistsForUser = posterGroupRepository.existsByUser_UserIdAndTags_NameIgnoreCase(userId, name);
        if (tagExistsForUser) {
            throw new BusinessException(ErrorCode.TAG_ALREADY_EXISTS);
        }

        // 2. 전체 태그 중 동일 이름 존재 여부 확인
        return tagRepository.findByNameIgnoreCase(name)
                .map(tag -> {
                    log.info("[TAG-CREATE] 기존 태그 존재: {}", tag.getId());
                    return new TagDto(tag.getId(), tag.getName());
                })
                .orElseGet(() -> {
                    Tag newTag = tagRepository.save(Tag.builder().name(name).build());
                    log.info("[TAG-CREATE] 새 태그 생성: {}", newTag.getId());
                    return new TagDto(newTag.getId(), newTag.getName());
                });
    }

    @Override
    @Transactional
    public void setPosterTags(Long groupId, List<Long> tagIds) {
        if (tagIds == null) {
            throw new BusinessException(ErrorCode.TAG_LIST_EMPTY);
        }

        PosterGroup posterGroup = posterGroupRepository.findById(groupId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POSTER_GROUP_NOT_FOUND));

        Set<Long> uniqueIds = new HashSet<>(tagIds);

        List<Tag> tags = uniqueIds.isEmpty()
                ? List.of()
                : tagRepository.findAllById(uniqueIds);

        if (tags.size() != uniqueIds.size()) {
            throw new BusinessException(ErrorCode.TAG_NOT_FOUND);
        }

        posterGroup.setTags(tags);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TagDto> getPosterTags(Long userId) {

        Set<Tag> tags = posterGroupRepository.findDistinctTagsByUserId(userId);

        return tags
                .stream()
                .map(tag -> new TagDto(tag.getId(), tag.getName()))
                .toList();
    }
}
