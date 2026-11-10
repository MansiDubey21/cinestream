package com.cinestream.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * Low-level client for the free TVmaze API (https://www.tvmaze.com/api).
 * No API key needed. Raw responses are cached (Redis, or in-memory in the "local" profile).
 */
@Component
public class TvMazeClient {

    private final RestClient client;

    public TvMazeClient(@Value("${app.tvmaze.base-url}") String baseUrl) {
        this.client = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("User-Agent", "CineStream/1.0 (portfolio project)")
                .build();
    }

    /** One page of the show index (about 250 shows per page). */
    @Cacheable(value = "tvmaze-raw", key = "'page:' + #page")
    public String showsPage(int page) {
        return client.get().uri(b -> b.path("/shows").queryParam("page", page).build())
                .retrieve().body(String.class);
    }

    /** A single show with its cast and seasons embedded. */
    @Cacheable(value = "tvmaze-raw", key = "'show:' + #id")
    public String show(long id) {
        return client.get().uri(b -> b.path("/shows/" + id)
                        .queryParam("embed[]", "cast")
                        .queryParam("embed[]", "seasons")
                        .build())
                .retrieve().body(String.class);
    }

    /** All images for a show (used to find a wide "background" image for the details view). */
    @Cacheable(value = "tvmaze-raw", key = "'images:' + #id")
    public String images(long id) {
        return client.get().uri("/shows/" + id + "/images").retrieve().body(String.class);
    }

    @Cacheable(value = "tvmaze-search", key = "#query.toLowerCase()")
    public String search(String query) {
        return client.get().uri(b -> b.path("/search/shows").queryParam("q", query).build())
                .retrieve().body(String.class);
    }
}
