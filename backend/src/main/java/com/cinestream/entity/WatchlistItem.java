package com.cinestream.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "watchlist_items",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "title_id", "media_type"}),
       indexes = @Index(name = "idx_watchlist_user", columnList = "user_id"))
public class WatchlistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "title_id", nullable = false)
    private Long titleId;

    @Column(name = "media_type", nullable = false, length = 10)
    private String mediaType;

    @Column(nullable = false)
    private String title;

    private String posterPath;
    private String backdropPath;
    private Double voteAverage;

    @Column(nullable = false, updatable = false)
    private Instant addedAt = Instant.now();

    protected WatchlistItem() {}

    public WatchlistItem(User user, Long titleId, String mediaType, String title,
                         String posterPath, String backdropPath, Double voteAverage) {
        this.user = user;
        this.titleId = titleId;
        this.mediaType = mediaType;
        this.title = title;
        this.posterPath = posterPath;
        this.backdropPath = backdropPath;
        this.voteAverage = voteAverage;
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public Long getTitleId() { return titleId; }
    public String getMediaType() { return mediaType; }
    public String getTitle() { return title; }
    public String getPosterPath() { return posterPath; }
    public String getBackdropPath() { return backdropPath; }
    public Double getVoteAverage() { return voteAverage; }
    public Instant getAddedAt() { return addedAt; }
}
