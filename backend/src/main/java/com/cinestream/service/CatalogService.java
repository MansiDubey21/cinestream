package com.cinestream.service;

import com.cinestream.exception.ApiException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;

import java.util.*;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Builds the CineStream catalogue (rows, genres, search, details) from TVmaze data.
 *
 * Every response uses one consistent JSON shape, so the React app never has to know
 * which provider the data came from:
 *   list   -> { page, total_pages, total_results, results: [Title] }
 *   Title  -> { id, name, overview, poster_path, backdrop_path, vote_average, first_air_date, media_type }
 * Image paths are full URLs.
 */
@Service
public class CatalogService {

    private static final Logger log = LoggerFactory.getLogger(CatalogService.class);

    /** How many index pages to load into the browse pool (~250 shows each). */
    private static final int POOL_PAGES = 8;
    private static final int ROW_SIZE = 20;

    private static final Comparator<JsonNode> BY_POPULARITY =
            Comparator.comparingInt((JsonNode n) -> n.path("weight").asInt()).reversed();
    private static final Comparator<JsonNode> BY_RATING =
            Comparator.comparingDouble((JsonNode n) -> rating(n)).reversed();
    private static final Comparator<JsonNode> BY_NEWEST =
            Comparator.comparing((JsonNode n) -> n.path("premiered").asText("")).reversed();

    private final TvMazeClient api;
    private final ObjectMapper om;

    public CatalogService(TvMazeClient api, ObjectMapper om) {
        this.api = api;
        this.om = om;
    }

    // ------------------------------------------------------------------ public API

    @Cacheable(value = "catalog-category", key = "#category + ':' + #page")
    public String category(String category, int page) {
        Stream<JsonNode> s = pool().stream();
        s = switch (category) {
            case "trending" -> s.sorted(BY_POPULARITY);
            // "popular" rows start after the trending ones so the rows don't repeat
            case "popular", "popular_tv" -> s.sorted(BY_POPULARITY).skip(ROW_SIZE * 2L);
            case "top_rated" -> s.filter(n -> n.path("weight").asInt() >= 60).sorted(BY_RATING);
            case "originals" -> s.filter(n -> n.path("webChannel").isObject()).sorted(BY_POPULARITY);
            case "now_playing" -> s.filter(n -> "Running".equals(n.path("status").asText())).sorted(BY_POPULARITY);
            case "upcoming" -> s.filter(n -> n.path("weight").asInt() >= 50).sorted(BY_NEWEST);
            default -> throw new ApiException(HttpStatus.BAD_REQUEST, "Unknown category: " + category);
        };
        return toPage(s.toList(), page);
    }

    @Cacheable(value = "catalog-genres", key = "'all'")
    public String genres() {
        // Genres ordered by how many shows have them
        Map<String, Long> counts = pool().stream()
                .flatMap(n -> stream(n.path("genres")).map(JsonNode::asText))
                .collect(Collectors.groupingBy(g -> g, Collectors.counting()));
        List<String> names = counts.entrySet().stream()
                .filter(e -> e.getValue() >= 10)
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(Map.Entry::getKey)
                .toList();

        ObjectNode root = om.createObjectNode();
        ArrayNode arr = root.putArray("genres");
        for (int i = 0; i < names.size(); i++) {
            arr.addObject().put("id", i + 1).put("name", names.get(i));
        }
        return write(root);
    }

    @Cacheable(value = "catalog-genre", key = "#genre.toLowerCase() + ':' + #page")
    public String byGenre(String genre, int page) {
        Predicate<JsonNode> hasGenre = n -> stream(n.path("genres")).anyMatch(g -> g.asText().equalsIgnoreCase(genre));
        return toPage(pool().stream().filter(hasGenre).sorted(BY_POPULARITY).toList(), page);
    }

    public String search(String query) {
        if (query == null || query.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Search query is required");
        }
        List<JsonNode> shows = stream(read(api.search(query.trim())))
                .map(r -> r.path("show"))
                .filter(n -> n.path("image").isObject())
                .toList();
        return toPage(shows, 1);
    }

    @Cacheable(value = "catalog-details", key = "#id")
    public String details(long id) {
        JsonNode show = read(api.show(id));
        ObjectNode out = toTitle(show);

        // Wide background image for the modal, if TVmaze has one
        String background = findBackground(id);
        if (background != null) out.put("backdrop_path", background);

        out.putNull("tagline");
        out.putNull("runtime");
        out.put("number_of_seasons", show.path("_embedded").path("seasons").size());

        ArrayNode genres = out.putArray("genres");
        int gi = 1;
        for (JsonNode g : show.path("genres")) genres.addObject().put("id", gi++).put("name", g.asText());

        ArrayNode cast = out.putObject("credits").putArray("cast");
        for (JsonNode c : show.path("_embedded").path("cast")) {
            cast.addObject()
                    .put("id", c.path("person").path("id").asLong())
                    .put("name", c.path("person").path("name").asText())
                    .put("character", c.path("character").path("name").asText());
        }

        // TVmaze has no trailers; the UI falls back to a YouTube search
        out.putObject("videos").putArray("results");

        // "More like this": popular shows sharing the first genre
        String firstGenre = show.path("genres").path(0).asText("");
        List<JsonNode> similar = firstGenre.isEmpty() ? List.of() : pool().stream()
                .filter(n -> n.path("id").asLong() != id)
                .filter(n -> stream(n.path("genres")).anyMatch(g -> g.asText().equals(firstGenre)))
                .sorted(BY_POPULARITY)
                .limit(12)
                .toList();
        out.set("similar", pageNode(similar, 1));

        return write(out);
    }

    // ------------------------------------------------------------------ helpers

    /** Browse pool: several pages of the TVmaze index, only shows that have a poster. */
    private List<JsonNode> pool() {
        List<JsonNode> all = new ArrayList<>();
        for (int p = 0; p < POOL_PAGES; p++) {
            try {
                stream(read(api.showsPage(p)))
                        .filter(n -> n.path("image").isObject())
                        .forEach(all::add);
            } catch (RestClientException e) {
                if (all.isEmpty()) throw e; // nothing loaded at all -> real error
                log.warn("Could not load TVmaze page {}: {}", p, e.getMessage());
            }
        }
        return all;
    }

    private String findBackground(long id) {
        try {
            for (JsonNode img : read(api.images(id))) {
                if ("background".equals(img.path("type").asText())) {
                    String url = img.path("resolutions").path("original").path("url").asText(null);
                    if (url != null) return url;
                }
            }
        } catch (RestClientException e) {
            log.debug("No images for show {}", id);
        }
        return null;
    }

    private String toPage(List<JsonNode> shows, int page) {
        return write(pageNode(shows, page));
    }

    private ObjectNode pageNode(List<JsonNode> shows, int page) {
        int total = shows.size();
        int totalPages = Math.max(1, (int) Math.ceil(total / (double) ROW_SIZE));
        ObjectNode root = om.createObjectNode();
        root.put("page", page).put("total_pages", totalPages).put("total_results", total);
        ArrayNode results = root.putArray("results");
        shows.stream().skip((long) (page - 1) * ROW_SIZE).limit(ROW_SIZE)
                .forEach(n -> results.add(toTitle(n)));
        return root;
    }

    /** TVmaze show -> CineStream "Title" JSON. */
    private ObjectNode toTitle(JsonNode n) {
        ObjectNode t = om.createObjectNode();
        t.put("id", n.path("id").asLong());
        t.put("name", n.path("name").asText());
        t.put("overview", stripHtml(n.path("summary").asText("")));
        JsonNode image = n.path("image");
        t.put("poster_path", image.path("medium").asText(image.path("original").asText(null)));
        t.put("backdrop_path", image.path("original").asText(image.path("medium").asText(null)));
        t.put("vote_average", rating(n));
        t.put("first_air_date", n.path("premiered").asText(""));
        t.put("media_type", "tv");
        return t;
    }

    private static double rating(JsonNode n) {
        return n.path("rating").path("average").asDouble(0);
    }

    private static String stripHtml(String html) {
        return html.replaceAll("<[^>]*>", "")
                .replace("&amp;", "&").replace("&quot;", "\"").replace("&#39;", "'")
                .replace("&lt;", "<").replace("&gt;", ">").replace("&nbsp;", " ")
                .trim();
    }

    private static Stream<JsonNode> stream(JsonNode arrayNode) {
        List<JsonNode> list = new ArrayList<>();
        arrayNode.forEach(list::add);
        return list.stream();
    }

    private JsonNode read(String json) {
        try {
            return om.readTree(json == null ? "[]" : json);
        } catch (JsonProcessingException e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Invalid response from data provider");
        }
    }

    private String write(JsonNode node) {
        try {
            return om.writeValueAsString(node);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(e);
        }
    }
}
