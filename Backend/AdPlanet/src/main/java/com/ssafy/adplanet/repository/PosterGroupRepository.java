package com.ssafy.adplanet.repository;

import com.ssafy.adplanet.entity.PosterGroup;
import com.ssafy.adplanet.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Set;

public interface PosterGroupRepository extends JpaRepository<PosterGroup, Long> {

    boolean existsByUser_UserIdAndTags_NameIgnoreCase(Long userId, String tagName);

    @Query("SELECT t FROM PosterGroup pg JOIN pg.tags t WHERE pg.user.userId = :userId")
    Set<Tag> findDistinctTagsByUserId(@Param("userId") Long userId);
}
