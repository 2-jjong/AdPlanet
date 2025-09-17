package com.ssafy.adplanet.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ci_guideline_template")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CiGuidelineTemplate {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String basicLogoRule;

    @Lob @Column(nullable = false, columnDefinition = "TEXT")
    private String minSizeRule;

    @Lob @Column(nullable = false, columnDefinition = "TEXT")
    private String marginRule;

    @Lob @Column(nullable = false, columnDefinition = "TEXT")
    private String backgroundRule;

    @Lob @Column(nullable = false, columnDefinition = "TEXT")
    private String prohibitionRule;

    @Column(name = "created_at", updatable = false, insertable = false)
    private java.time.LocalDateTime createdAt;
}

