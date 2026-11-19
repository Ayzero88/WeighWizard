package com.weighwiz.weighwizbackend.db;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class DatabaseService {

    private final JdbcTemplate jdbc;

    public DatabaseService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public boolean isConnected() {
        try {
            jdbc.queryForObject("SELECT 1", Integer.class);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
