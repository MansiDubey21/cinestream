package com.cinestream.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.Map;

/**
 * TVmaze responses (and the rows built from them) are cached in Redis as JSON strings.
 * This cuts repeat calls to the external API and makes browsing pages load much faster.
 */
@Configuration
// Only when Redis caching is on. The "local" profile switches to an in-memory cache instead.
@ConditionalOnProperty(name = "spring.cache.type", havingValue = "redis", matchIfMissing = true)
public class RedisCacheConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory factory,
                                          @Value("${app.cache.ttl-minutes}") long ttlMinutes) {
        RedisCacheConfiguration base = RedisCacheConfiguration.defaultCacheConfig()
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .disableCachingNullValues()
                .prefixCacheNameWith("cinestream:")
                .entryTtl(Duration.ofMinutes(ttlMinutes));

        return RedisCacheManager.builder(factory)
                .cacheDefaults(base)
                .withInitialCacheConfigurations(Map.of(
                        // search results -> shorter TTL
                        "tvmaze-search", base.entryTtl(Duration.ofMinutes(10)),
                        // the big show index changes slowly -> keep longer
                        "tvmaze-raw", base.entryTtl(Duration.ofHours(6)),
                        "catalog-genres", base.entryTtl(Duration.ofHours(24))))
                .build();
    }
}
