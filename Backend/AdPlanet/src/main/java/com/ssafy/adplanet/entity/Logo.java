package com.ssafy.adplanet.entity;

import com.ssafy.adplanet.enums.LogoStyle;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "logo")
public class Logo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "slogan", length = 200)
    private String slogan;

    @Column(name = "prompt", nullable = false, length = 255)
    private String prompt;

    @Setter
    @Column(name = "img_url", nullable = false, length = 200)
    private String imgUrl;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "style", length = 20, nullable = false)
    private LogoStyle style;

    public void changeImgUrl(String newUrl) {
        this.imgUrl = newUrl;
    }

}
