package com.ssafy.adplanet.repository;

import com.ssafy.adplanet.entity.CiGuideline;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CiGuidelineRepository extends JpaRepository<CiGuideline, Long> {
    Optional<CiGuideline> findByLogoId(Long logoId);
    boolean existsByLogoId(Long logoId);
}
