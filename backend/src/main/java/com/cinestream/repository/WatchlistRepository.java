package com.cinestream.repository;

import com.cinestream.entity.WatchlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface WatchlistRepository extends JpaRepository<WatchlistItem, Long> {
    List<WatchlistItem> findByUserIdOrderByAddedAtDesc(Long userId);
    boolean existsByUserIdAndTitleIdAndMediaType(Long userId, Long titleId, String mediaType);

    @Transactional
    long deleteByUserIdAndTitleIdAndMediaType(Long userId, Long titleId, String mediaType);
}
