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

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "template_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ci_template"))
    private CiGuidelineTemplate template;

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