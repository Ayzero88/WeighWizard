package com.weighwiz.weighwizbackend.db;

import java.time.OffsetDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class UserService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role;

    // Comma-separated scale ids this user may weigh on, e.g. "GATE_1,GATE_3". Null or empty = all scales.
    @Column(name = "allowed_scales")
    private String allowedScales;

    @Column(name = "date_created", nullable = false, updatable = false)
    private OffsetDateTime dateCreated;

    // Constructors, getters, and setters

    public UserService() {}

    public UserService(String username, String password, String role) {
        this.username = username;
        this.password = password;
        this.role = role;
    }

    // Automatically set dateCreated before persisting
    @PrePersist
    protected void onCreate() {
        this.dateCreated = OffsetDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getAllowedScales() {
        return allowedScales;
    }

    public void setAllowedScales(String allowedScales) {
        this.allowedScales = allowedScales;
    }
    
}
