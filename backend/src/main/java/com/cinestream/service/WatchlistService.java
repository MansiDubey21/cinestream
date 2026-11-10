package com.cinestream.service;

import com.cinestream.dto.WatchlistDtos.AddRequest;
import com.cinestream.dto.WatchlistDtos.ItemResponse;
import com.cinestream.entity.User;
import com.cinestream.entity.WatchlistItem;
import com.cinestream.exception.ApiException;
import com.cinestream.repository.UserRepository;
import com.cinestream.repository.WatchlistRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final UserRepository userRepository;

    public WatchlistService(WatchlistRepository watchlistRepository, UserRepository userRepository) {
        this.watchlistRepository = watchlistRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ItemResponse> list(Long userId) {
        return watchlistRepository.findByUserIdOrderByAddedAtDesc(userId).stream()
                .map(WatchlistService::toResponse)
                .toList();
    }

    @Transactional
    public ItemResponse add(Long userId, AddRequest req) {
        if (watchlistRepository.existsByUserIdAndTitleIdAndMediaType(userId, req.titleId(), req.mediaType())) {
            throw new ApiException(HttpStatus.CONFLICT, "Already in My List");
        }
        User user = userRepository.getReferenceById(userId);
        WatchlistItem saved = watchlistRepository.save(new WatchlistItem(
                user, req.titleId(), req.mediaType(), req.title(),
                req.posterPath(), req.backdropPath(), req.voteAverage()));
        return toResponse(saved);
    }

    @Transactional
    public void remove(Long userId, String mediaType, Long titleId) {
        long deleted = watchlistRepository.deleteByUserIdAndTitleIdAndMediaType(userId, titleId, mediaType);
        if (deleted == 0) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Item not in My List");
        }
    }

    private static ItemResponse toResponse(WatchlistItem i) {
        return new ItemResponse(i.getTitleId(), i.getMediaType(), i.getTitle(),
                i.getPosterPath(), i.getBackdropPath(), i.getVoteAverage(), i.getAddedAt());
    }
}
