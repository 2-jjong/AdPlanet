package com.ssafy.adplanet.repository;

import com.ssafy.adplanet.entity.ImageJob;
import com.ssafy.adplanet.enums.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImageJobRepository extends JpaRepository<ImageJob, String> {

    List<ImageJob> findByPosterGroupIdAndStatus(Long groupId, JobStatus status);

}
