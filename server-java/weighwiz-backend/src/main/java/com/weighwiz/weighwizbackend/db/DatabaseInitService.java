package com.weighwiz.weighwizbackend.db;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class DatabaseInitService {

    private final JdbcTemplate jdbc;

    @Value("${spring.datasource.url}")
    private String dbUrl;

    public DatabaseInitService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void createTables() {

        jdbc.execute("""
            CREATE TABLE IF NOT EXISTS transact (
                tid VARCHAR(50) PRIMARY KEY NOT NULL UNIQUE,
                first_weight NUMERIC,
                last_weight NUMERIC,
                tare_weight NUMERIC,
                net_weight NUMERIC,
                gross_weight NUMERIC,
                company TEXT,
                address TEXT,
                product TEXT,
                carrier TEXT,
                operator TEXT,
                dest TEXT,
                tel TEXT,
                vehicle_no TEXT,
                batch_no VARCHAR(50),
                ops_type VARCHAR(50),
                unit VARCHAR(10),
                fw_date TIMESTAMPTZ DEFAULT NOW(),
                sw_date TIMESTAMPTZ DEFAULT NOW(),
                tw_date TIMESTAMPTZ DEFAULT NOW(),
                nw_date TIMESTAMPTZ DEFAULT NOW(),
                gw_date TIMESTAMPTZ DEFAULT NOW(),
                capdate TIMESTAMPTZ DEFAULT NOW()
            );
        """);

        jdbc.execute("""
            CREATE TABLE IF NOT EXISTS scale_params (
                id SERIAL PRIMARY KEY,
                port TEXT,
                baud_rate INT,
                databits INT,
                stopbits INT,
                parity TEXT,
                flow_control TEXT
            );
        """);

        jdbc.execute("""
            CREATE TABLE IF NOT EXISTS print_type (
                id SERIAL PRIMARY KEY,
                ptype TEXT,
                adjust_decimal INT,
                edit TEXT
            );
        """);
        
        jdbc.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                date_created TIMESTAMPTZ DEFAULT NOW()
            );
        """);

        jdbc.execute("""
            CREATE TABLE IF NOT EXISTS ownerinfo (
                id BIGSERIAL PRIMARY KEY,
                owner TEXT,
                address TEXT,
                tel TEXT,
                email TEXT,
                logo BYTEA,
                date_created TIMESTAMPTZ DEFAULT NOW()
            );
        """);
    }
}
    
