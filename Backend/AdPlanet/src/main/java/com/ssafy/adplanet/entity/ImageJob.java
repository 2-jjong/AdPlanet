package com.ssafy.adplanet.entity;

import com.ssafy.adplanet.enums.JobStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageJob {

    @Id
    @Column(name = "id", unique = true, nullable = false)
    String id;

    @Column(name = "status", nullable = false)
    JobStatus status;

    @Column(name = "created_at", nullable = false)
    LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    LocalDateTime updatedAt;

    @OneToOne
    @JoinColumn(name = "poster_id")
    Poster resultPoster;
}
