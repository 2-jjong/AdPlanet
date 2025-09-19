package com.ssafy.adplanet.entity;

import com.ssafy.adplanet.enums.LogoStyle;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

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

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

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

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable (
            name = "logo_tag",
            joinColumns = @JoinColumn(name = "logo_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();

    public void setTags(Collection<Tag> newTags) {
        this.tags.clear();
        this.tags.addAll(newTags);
    }

    public void changeImgUrl(String newUrl) {
        this.imgUrl = newUrl;
    }

}
