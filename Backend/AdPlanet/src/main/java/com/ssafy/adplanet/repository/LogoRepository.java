package com.ssafy.adplanet.repository;

import com.ssafy.adplanet.entity.Logo;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LogoRepository extends JpaRepository<Logo, Long> {
    List<Logo> findByUser_UserId(Long userId, Sort sort);

    @Query("""
        SELECT l FROM Logo l
          JOIN l.tags t
         WHERE l.user.userId = :userId
           AND t.id IN :tagIds
         GROUP BY l.id
        HAVING COUNT(DISTINCT t.id) = :tagCount
        """)
    List<Logo> findByUserIdAndAllTags(
            @Param("userId") Long userId,
            @Param("tagIds") List<Long> tagIds,
            @Param("tagCount") long tagCount,
            Sort sort
    );
}
