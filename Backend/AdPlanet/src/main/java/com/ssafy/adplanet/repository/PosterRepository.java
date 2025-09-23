package com.ssafy.adplanet.repository;

import com.ssafy.adplanet.entity.Poster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PosterRepository extends JpaRepository<Poster, Long> {

    List<Poster> findByPosterGroup_IdOrderByCreatedAtAsc(Long groupId);
}
