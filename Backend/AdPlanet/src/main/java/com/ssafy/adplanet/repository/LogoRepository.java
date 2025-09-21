package com.ssafy.adplanet.repository;

import com.ssafy.adplanet.entity.Logo;
import com.ssafy.adplanet.entity.User;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

import java.util.List;

public interface LogoRepository extends JpaRepository<Logo, Long> {

    // 태그 미선택: tags까지 한 번에 로딩 (N+1 방지)
    @EntityGraph(attributePaths = "tags")
    List<Logo> findByUser_UserId(Long userId, Sort sort);

    // 태그 AND 필터: 로고 ID만 먼저 뽑기
    @Query("""
        SELECT l.id FROM Logo l
          JOIN l.tags t
         WHERE l.user.userId = :userId
           AND t.id IN :tagIds
         GROUP BY l.id
        HAVING COUNT(DISTINCT t.id) = :tagCount
        """)
    List<Long> findIdsByUserIdAndAllTags(
            @Param("userId") Long userId,
            @Param("tagIds") List<Long> tagIds,
            @Param("tagCount") long tagCount
    );

    // 위 ID들로 태그까지 한 번에 가져오기 (fetch join)
    @Query("""
        SELECT DISTINCT l FROM Logo l
        LEFT JOIN FETCH l.tags
        WHERE l.id IN :ids
        """)
    List<Logo> findAllWithTagsByIdIn(@Param("ids") List<Long> ids);

    Optional<Logo> findByIdAndUser_UserId(Long id, Long userId);

    Long user(User user);
}
