package com.ssafy.adplanet.repository;

import com.ssafy.adplanet.entity.Poster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PosterRepository extends JpaRepository<Poster, Long> {

    @Query("SELECT p FROM Poster p WHERE p.posterGroup.id = :groupId ORDER BY p.createdAt ASC")
    List<Poster> findByGroupId(@Param("groupId") Long groupId);
}
