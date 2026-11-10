package com.cinestream.controller;

import com.cinestream.dto.WatchlistDtos.AddRequest;
import com.cinestream.dto.WatchlistDtos.ItemResponse;
import com.cinestream.security.AuthUser;
import com.cinestream.service.WatchlistService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/my-list")
public class WatchlistController {

    private final WatchlistService watchlistService;

    public WatchlistController(WatchlistService watchlistService) {
        this.watchlistService = watchlistService;
    }

    @GetMapping
    public List<ItemResponse> list(@AuthenticationPrincipal AuthUser user) {
        return watchlistService.list(user.getId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ItemResponse add(@AuthenticationPrincipal AuthUser user, @Valid @RequestBody AddRequest req) {
        return watchlistService.add(user.getId(), req);
    }

    @DeleteMapping("/{mediaType}/{titleId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@AuthenticationPrincipal AuthUser user,
                       @PathVariable String mediaType, @PathVariable Long titleId) {
        watchlistService.remove(user.getId(), mediaType, titleId);
    }
}
