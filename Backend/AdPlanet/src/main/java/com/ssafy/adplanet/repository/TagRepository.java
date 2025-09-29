package com.ssafy.adplanet.repository;

import com.ssafy.adplanet.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface  TagRepository extends JpaRepository<Tag, Long> {
    Optional<Tag> findByNameIgnoreCase(String name);
    @Query("""
        SELECT DISTINCT t
          FROM Logo l
          JOIN l.tags t
         WHERE l.user.userId = :userId
         ORDER BY t.name ASC
    """)
    List<Tag> findDistinctByUserId(@Param("userId") Long userId);

    @Query("""
        SELECT DISTINCT t
          FROM Logo l
          JOIN l.tags t
         WHERE l.user.userId = :userId
           AND (:keyword IS NULL OR :keyword = '' 
                OR LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
         ORDER BY t.name ASC
    """)
    List<Tag> findDistinctByUserIdAndKeyword(
            @Param("userId") Long userId,
            @Param("keyword") String keyword);
}
