package com.cinestream;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class CineStreamApplication {
    public static void main(String[] args) {
        SpringApplication.run(CineStreamApplication.class, args);
    }
}
