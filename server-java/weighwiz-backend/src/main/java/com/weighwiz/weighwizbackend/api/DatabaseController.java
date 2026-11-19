package com.weighwiz.weighwizbackend.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.weighwiz.weighwizbackend.db.DatabaseService;

@RestController
public class DatabaseController {
    private final DatabaseService db;

    public DatabaseController(DatabaseService db) {
        this.db = db;
    }

    @GetMapping("/db-con-check")
    public Object checkDb() {
        return db.isConnected()
                ? new Status("connected")
                : new Status("not connected");
    }

    record Status(String status) {}    
}
