package com.ssafy.adplanet.repository;

import com.ssafy.adplanet.entity.ImageJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ImageJobRepository extends JpaRepository<ImageJob, String> {

    @Query("SELECT j FROM ImageJob j " +
            "WHERE j.posterGroup.id = :groupId " +
            "AND j.status = com.ssafy.adplanet.enums.JobStatus.PROCESSING")
    List<ImageJob> findProgressingJobsByGroupId(@Param("groupId") Long groupId);
}
