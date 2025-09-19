package com.ssafy.adplanet.repository;

import com.ssafy.adplanet.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface  TagRepository extends JpaRepository<Tag, Long> {
    Optional<Tag> findByNameIgnoreCase(String name);
    List<Tag> findAllByOrderByNameAsc();
    List<Tag> findByNameContainingIgnoreCaseOrderByNameAsc(String name);
}
