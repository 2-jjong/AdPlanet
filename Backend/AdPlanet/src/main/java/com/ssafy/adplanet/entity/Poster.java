package com.ssafy.adplanet.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Poster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private PosterGroup posterGroup;

    @Column(name = "prompt", nullable = false)
    private String prompt;

    @Column(name = "img_url", nullable = false)
    private String imgUrl;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
