package com.ssafy.adplanet.repository;

import com.ssafy.adplanet.entity.CiGuideline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface CiGuidelineRepository extends JpaRepository<CiGuideline, Long> {
    Optional<CiGuideline> findByLogoId(Long logoId);

    // 조인 페치로 N + 1 방지
    @Query("select c from CiGuideline c " +
            "join fetch c.logo " +
            "join fetch c.template " +
            "where c.logo.id = :logoId")
    Optional<CiGuideline> findByLogoIdWithTemplate(Long logoId);

    boolean existsByLogoId(Long logoId);
}
