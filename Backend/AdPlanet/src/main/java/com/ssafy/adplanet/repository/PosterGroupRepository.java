package com.ssafy.adplanet.repository;

import com.ssafy.adplanet.entity.PosterGroup;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PosterGroupRepository extends JpaRepository<PosterGroup, Long> {

    boolean existsByUser_UserIdAndTags_NameIgnoreCase(Long userId, String tagName);

}
