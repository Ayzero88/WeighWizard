package com.weighwiz.weighwizbackend.config;

import org.springframework.stereotype.Component;

import com.weighwiz.weighwizbackend.db.DatabaseInitService;

import jakarta.annotation.PostConstruct;

@Component
public class StartupDatabaseInitializer {

    private final DatabaseInitService initService;

    public StartupDatabaseInitializer(DatabaseInitService initService) {
        this.initService = initService;
    }

    @PostConstruct
    public void init() {
        initService.createTables();
    }
}

