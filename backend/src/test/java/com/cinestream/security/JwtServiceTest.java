package com.cinestream.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private final JwtService jwt = new JwtService("test-secret-key-that-is-at-least-32-characters-long", 60_000);

    @Test
    void generatedTokenIsValidAndReturnsEmail() {
        String token = jwt.generateToken(1L, "mansi@example.com");
        assertEquals("mansi@example.com", jwt.validateAndGetEmail(token));
    }

    @Test
    void tamperedTokenIsRejected() {
        String token = jwt.generateToken(1L, "mansi@example.com");
        assertNull(jwt.validateAndGetEmail(token + "x"));
    }

    @Test
    void tokenSignedWithDifferentKeyIsRejected() {
        JwtService other = new JwtService("another-secret-key-that-is-at-least-32-chars!!", 60_000);
        assertNull(jwt.validateAndGetEmail(other.generateToken(1L, "a@b.com")));
    }

    @Test
    void expiredTokenIsRejected() {
        JwtService shortLived = new JwtService("test-secret-key-that-is-at-least-32-characters-long", -1000);
        assertNull(shortLived.validateAndGetEmail(shortLived.generateToken(1L, "a@b.com")));
    }
}
