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

    private void seedScaleParams() {
            jdbc.update("""
                INSERT INTO scale_params
                    (scale_id, enabled, port, baud_rate, databits, stopbits, parity, flow_control)
                VALUES
                    ('GATE_1', TRUE, 'COM1', 9600, 8, 1, 'NONE', 'NONE')
                ON CONFLICT (scale_id) DO NOTHING
            """);

            jdbc.update("""
                INSERT INTO scale_params
                    (scale_id, enabled, port, baud_rate, databits, stopbits, parity, flow_control)
                VALUES
                    ('GATE_2', FALSE, 'COM2', 9600, 8, 1, 'NONE', 'NONE')
                ON CONFLICT (scale_id) DO NOTHING
            """);
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
                operator_name TEXT,
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
                capdate TIMESTAMPTZ DEFAULT NOW(),
                remark TEXT,
                scale_1 VARCHAR(20),
                scale_2 VARCHAR(20)
            );
        """);

        jdbc.execute("""
            CREATE TABLE IF NOT EXISTS deleted_transact (
                id BIGSERIAL PRIMARY KEY,
                original_tid VARCHAR(50),
                first_weight NUMERIC,
                last_weight NUMERIC,
                tare_weight NUMERIC,
                net_weight NUMERIC,
                gross_weight NUMERIC,
                company TEXT,
                address TEXT,
                product TEXT,
                carrier TEXT,
                operator_name TEXT,
                dest TEXT,
                tel TEXT,
                vehicle_no TEXT,
                batch_no VARCHAR(50),
                ops_type VARCHAR(50),
                unit VARCHAR(10),
                fw_date TIMESTAMPTZ,
                sw_date TIMESTAMPTZ,
                tw_date TIMESTAMPTZ,
                nw_date TIMESTAMPTZ,
                gw_date TIMESTAMPTZ,
                capdate TIMESTAMPTZ,
                remark TEXT,
                scale_1 VARCHAR(20),
                scale_2 VARCHAR(20),
                deleted_at TIMESTAMPTZ DEFAULT NOW(),
                deleted_by TEXT
            );
        """);
        jdbc.execute("""
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tid_seq' AND relkind = 'S') THEN
                    CREATE SEQUENCE tid_seq;
                    PERFORM setval('tid_seq', COALESCE((SELECT MAX(t) FROM (
                        SELECT tid::bigint AS t FROM transact WHERE tid ~ '^[0-9]+$'
                        UNION ALL
                        SELECT original_tid::bigint AS t FROM deleted_transact WHERE original_tid ~ '^[0-9]+$'
                    ) s), 0), true);
                END IF;
            END $$;
        """);

        jdbc.execute("""
            CREATE TABLE IF NOT EXISTS scale_params (
                id SERIAL PRIMARY KEY,
                scale_id TEXT UNIQUE NOT NULL,
                enabled BOOLEAN DEFAULT TRUE,
                port TEXT,
                baud_rate INT,
                databits INT,
                stopbits INT,
                parity TEXT,
                flow_control TEXT,
                connection_type TEXT DEFAULT 'SERIAL',
                host TEXT,
                tcp_port INT
            );
        """);

        seedScaleParams();

        jdbc.execute("""
            CREATE TABLE IF NOT EXISTS print_type (
                id SERIAL PRIMARY KEY,
                scale_id TEXT UNIQUE,
                ptype TEXT,
                adjust_decimal INT,
                capacity DOUBLE PRECISION NOT NULL,
                resolution DOUBLE PRECISION NOT NULL,
                edit TEXT
            );
        """);
        
        jdbc.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id BIGSERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                date_created TIMESTAMPTZ DEFAULT NOW()
            );
        """);

        jdbc.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id BIGSERIAL PRIMARY KEY,
                action TEXT,
                performed_by TEXT,
                target TEXT,
                timestamp TIMESTAMPTZ DEFAULT NOW()
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
    
