package com.ssafy.adplanet.repository;

import com.ssafy.adplanet.entity.PosterGroup;
import com.ssafy.adplanet.entity.Tag;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface PosterGroupRepository extends JpaRepository<PosterGroup, Long> {

    boolean existsByUser_UserIdAndTags_NameIgnoreCase(Long userId, String tagName);

    @Query("SELECT t FROM PosterGroup pg JOIN pg.tags t WHERE pg.user.userId = :userId")
    Set<Tag> findDistinctTagsByUserId(@Param("userId") Long userId);

    List<PosterGroup> findByUser_UserId(Long userId);

    // 태그 미선택: tags까지 한 번에 로딩 (N+1 방지)
    @EntityGraph(attributePaths = "tags")
    List<PosterGroup> findByUser_UserId(Long userId, Sort sort);

    // 태그 AND 필터: 로고 ID만 먼저 뽑기
    @Query("""
        SELECT pg.id FROM PosterGroup pg
          JOIN pg.tags t
         WHERE pg.user.userId = :userId
           AND t.id IN :tagIds
         GROUP BY pg.id
        HAVING COUNT(DISTINCT t.id) = :tagCount
        """)
    List<Long> findIdsByUserIdAndAllTags(
            @Param("userId") Long userId,
            @Param("tagIds") List<Long> tagIds,
            @Param("tagCount") long tagCount
    );

    // 위 ID들로 태그까지 한 번에 가져오기 (fetch join)
    @Query("""
        SELECT DISTINCT pg FROM PosterGroup pg
        LEFT JOIN FETCH pg.tags
        WHERE pg.id IN :ids
        """)
    List<PosterGroup> findAllWithTagsByIdIn(@Param("ids") List<Long> ids);

    @Query("SELECT pg FROM PosterGroup pg " +
            "LEFT JOIN FETCH pg.mainPoster " +
            "LEFT JOIN FETCH pg.tags " +
            "WHERE pg.id = :groupId")
    Optional<PosterGroup> findByIdWithMainPosterAndTags(@Param("groupId") Long groupId);
}
