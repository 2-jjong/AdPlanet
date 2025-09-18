package com.ssafy.adplanet.repository;

import com.ssafy.adplanet.entity.CiGuidelineTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CiGuidelineTemplateRepository extends JpaRepository<CiGuidelineTemplate, Long> {
    Optional<CiGuidelineTemplate> findTopByOrderByIdDesc();
}
