package com.cinestream.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.Instant;

public final class WatchlistDtos {
    private WatchlistDtos() {}

    public record AddRequest(
            @NotNull Long titleId,
            @NotBlank @Pattern(regexp = "movie|tv") String mediaType,
            @NotBlank String title,
            String posterPath,
            String backdropPath,
            Double voteAverage) {}

    public record ItemResponse(
            Long titleId,
            String mediaType,
            String title,
            String posterPath,
            String backdropPath,
            Double voteAverage,
            Instant addedAt) {}
}
