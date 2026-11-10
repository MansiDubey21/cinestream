package com.cinestream.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/** Checks that TVmaze data is converted into the JSON shape the React app expects. */
class CatalogServiceTest {

    private static final String PAGE_0 = """
        [
          {"id":1,"name":"Low Show","genres":["Drama"],"status":"Ended","weight":40,"premiered":"2010-01-01",
           "rating":{"average":6.1},"image":{"medium":"http://img/1m.jpg","original":"http://img/1o.jpg"},
           "summary":"<p>Low <b>show</b> &amp; more</p>","webChannel":null},
          {"id":2,"name":"Big Show","genres":["Drama","Crime"],"status":"Running","weight":99,"premiered":"2020-05-05",
           "rating":{"average":8.9},"image":{"medium":"http://img/2m.jpg","original":"http://img/2o.jpg"},
           "summary":"<p>Big</p>","webChannel":{"id":1,"name":"Some Stream"}},
          {"id":3,"name":"No Image","genres":["Drama"],"weight":100,"image":null}
        ]""";

    private static final String SHOW_2 = """
        {"id":2,"name":"Big Show","genres":["Drama","Crime"],"weight":99,"premiered":"2020-05-05",
         "rating":{"average":8.9},"image":{"medium":"http://img/2m.jpg","original":"http://img/2o.jpg"},
         "summary":"<p>Big</p>",
         "_embedded":{
           "cast":[{"person":{"id":7,"name":"Actor A"},"character":{"name":"Hero"}}],
           "seasons":[{"id":1},{"id":2},{"id":3}]
         }}""";

    private TvMazeClient api;
    private CatalogService catalog;
    private final ObjectMapper om = new ObjectMapper();

    @BeforeEach
    void setUp() {
        api = mock(TvMazeClient.class);
        when(api.showsPage(anyInt())).thenReturn("[]");
        when(api.showsPage(0)).thenReturn(PAGE_0);
        when(api.show(2L)).thenReturn(SHOW_2);
        when(api.images(anyLong())).thenReturn("""
            [{"type":"background","resolutions":{"original":{"url":"http://img/2bg.jpg"}}}]""");
        catalog = new CatalogService(api, om);
    }

    @Test
    void trendingIsSortedByPopularityAndSkipsShowsWithoutImages() throws Exception {
        JsonNode res = om.readTree(catalog.category("trending", 1));
        assertEquals(2, res.path("results").size());
        assertEquals("Big Show", res.path("results").path(0).path("name").asText());
        assertEquals("tv", res.path("results").path(0).path("media_type").asText());
        assertEquals("http://img/2m.jpg", res.path("results").path(0).path("poster_path").asText());
    }

    @Test
    void summaryHtmlIsStripped() throws Exception {
        JsonNode res = om.readTree(catalog.category("trending", 1));
        assertEquals("Low show & more", res.path("results").path(1).path("overview").asText());
    }

    @Test
    void originalsOnlyIncludesStreamingShows() throws Exception {
        JsonNode res = om.readTree(catalog.category("originals", 1));
        assertEquals(1, res.path("results").size());
        assertEquals(2, res.path("results").path(0).path("id").asInt());
    }

    @Test
    void genreFilterIsCaseInsensitive() throws Exception {
        JsonNode res = om.readTree(catalog.byGenre("crime", 1));
        assertEquals(1, res.path("results").size());
    }

    @Test
    void detailsIncludeCastSeasonsBackgroundAndSimilar() throws Exception {
        JsonNode d = om.readTree(catalog.details(2));
        assertEquals("Actor A", d.path("credits").path("cast").path(0).path("name").asText());
        assertEquals(3, d.path("number_of_seasons").asInt());
        assertEquals("http://img/2bg.jpg", d.path("backdrop_path").asText());
        assertEquals("Low Show", d.path("similar").path("results").path(0).path("name").asText());
        assertTrue(d.path("videos").path("results").isArray());
    }

    @Test
    void unknownCategoryIsRejected() {
        assertThrows(RuntimeException.class, () -> catalog.category("nope", 1));
    }
}
