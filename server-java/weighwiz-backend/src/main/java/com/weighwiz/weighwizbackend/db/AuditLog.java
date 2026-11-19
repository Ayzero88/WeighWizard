package com.weighwiz.weighwizbackend.db;

import java.time.OffsetDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String action;

    private String performedBy;

    private String target;

    private OffsetDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        this.timestamp = OffsetDateTime.now();
    }

    // getters/setters
    // ===== Getters and Setters =====

public Long getId() {
    return id;
}

public void setId(Long id) {
    this.id = id;
}

public String getAction() {
    return action;
}

public void setAction(String action) {
    this.action = action;
}

public String getPerformedBy() {
    return performedBy;
}

public void setPerformedBy(String performedBy) {
    this.performedBy = performedBy;
}

public String getTarget() {
    return target;
}

public void setTarget(String target) {
    this.target = target;
}

public OffsetDateTime getTimestamp() {
    return timestamp;
}

public void setTimestamp(OffsetDateTime timestamp) {
    this.timestamp = timestamp;
}
}
