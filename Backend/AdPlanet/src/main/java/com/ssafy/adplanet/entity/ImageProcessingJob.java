package com.ssafy.adplanet.entity;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ssafy.adplanet.dto.poster.response.PosterResponse;
import com.ssafy.adplanet.enums.JobStatus;
import com.ssafy.adplanet.enums.PosterStyle;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageProcessingJob{

    @Id
    @Column(name = "id")
    String id;

    @Column(name = "status", nullable = false)
    JobStatus status;

    @Column(name = "group_id")
    PosterStyle style;

    @Column(name = "prompt", nullable = false)
    String prompt;

    //

    @Column(name = "created_at", nullable = false)
    LocalDateTime createdAt;

    @OneToOne
    @JoinColumn(name = "poster_id", nullable = false)
    Poster poster;
}
