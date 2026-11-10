package com.cinestream.controller;

import com.cinestream.exception.ApiException;
import com.cinestream.service.CatalogService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/** Browse / search endpoints. Data comes from TVmaze (cached). */
@RestController
@RequestMapping("/api/movies")
@Validated
public class MovieController {

    private final CatalogService catalog;

    public MovieController(CatalogService catalog) {
        this.catalog = catalog;
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<String> category(@PathVariable String category,
                                           @RequestParam(defaultValue = "1") @Min(1) @Max(100) int page) {
        return json(catalog.category(category, page));
    }

    @GetMapping("/genres")
    public ResponseEntity<String> genres() {
        return json(catalog.genres());
    }

    @GetMapping("/genre/{genre}")
    public ResponseEntity<String> byGenre(@PathVariable String genre,
                                          @RequestParam(defaultValue = "1") @Min(1) @Max(100) int page) {
        return json(catalog.byGenre(genre, page));
    }

    @GetMapping("/{mediaType}/{id}")
    public ResponseEntity<String> details(@PathVariable String mediaType, @PathVariable long id) {
        if (!mediaType.equals("tv") && !mediaType.equals("movie")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "mediaType must be 'tv' or 'movie'");
        }
        return json(catalog.details(id));
    }

    @GetMapping("/search")
    public ResponseEntity<String> search(@RequestParam("q") String query) {
        return json(catalog.search(query));
    }

    private static ResponseEntity<String> json(String body) {
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(body);
    }
}
