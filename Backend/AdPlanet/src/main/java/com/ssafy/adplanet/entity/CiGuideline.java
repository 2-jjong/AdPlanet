package com.ssafy.adplanet.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "ci_guideline",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_ci_guideline_logo", columnNames = "logo_id")
        }
)
@EntityListeners(AuditingEntityListener.class)
public class CiGuideline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "logo_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ci_logo"))
    private Logo logo;

    // --- 로고 사용 규정 ---
    @Lob @Column(name = "basic_logo_rule", nullable = false, columnDefinition = "TEXT")
    private String basicLogoRule;             // 기본 로고

    @Lob @Column(name = "min_size_rule", nullable = false, columnDefinition = "TEXT")
    private String minSizeRule;               // 최소 사이즈

    @Lob @Column(name = "margin_rule", nullable = false, columnDefinition = "TEXT")
    private String marginRule;                // 여백 규정

    @Lob @Column(name = "background_rule", nullable = false, columnDefinition = "TEXT")
    private String backgroundRule;            // 배경 규정

    @Lob @Column(name = "prohibition_rule", nullable = false, columnDefinition = "TEXT")
    private String prohibitionRule;           // 로고 변형 금지

    @Column(name = "primary_color", length = 7, nullable = false)
    private String primaryColor;              // #RRGGBB

    @Column(name = "secondary_color", length = 7, nullable = false)
    private String secondaryColor;            // #RRGGBB

    @Column(name = "neutral_color", length = 7, nullable = false)
    private String neutralColor;              // #RRGGBB

    @Lob @Column(name = "primary_guide", nullable = false, columnDefinition = "TEXT")
    private String primaryGuide;

    @Lob @Column(name = "secondary_guide", nullable = false, columnDefinition = "TEXT")
    private String secondaryGuide;

    @Lob @Column(name = "neutral_guide", nullable = false, columnDefinition = "TEXT")
    private String neutralGuide;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

}