package com.weighwiz.weighwizbackend.db;

import jakarta.persistence.*;

import java.sql.Types;
import java.time.OffsetDateTime;

import org.hibernate.annotations.JdbcTypeCode;

@Entity
@Table(name = "ownerinfo")
public class OwnersInfoService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String owner;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String tel;

    @Column(nullable = false)
    private String email;

    //Automatically called BEFORE insert
    @PrePersist
    protected void onCreate() {
        this.dateCreated = OffsetDateTime.now();
    }

    @Lob
    @JdbcTypeCode(Types.BINARY)
    private byte[] logo;

    @Column(nullable = false)
    private OffsetDateTime dateCreated;

    // Constructors
    public OwnersInfoService() {}

    public OwnersInfoService(String owner, String address, String tel, String email, byte[] logo) {
        this.owner = owner;
        this.address = address;
        this.tel = tel;
        this.email = email;
        this.logo = logo;
        this.dateCreated = OffsetDateTime.now();
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOwner() { return owner; }
    public void setOwner(String owner) { this.owner = owner; }

    public byte[] getLogo() { return logo; }
    public void setLogo(byte[] logo) { this.logo = logo; }

    public OffsetDateTime getDateCreated() { return dateCreated; }
    public void setDateCreated(OffsetDateTime dateCreated) { this.dateCreated = dateCreated; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getTel() { return tel; }
    public void setTel(String tel) { this.tel = tel; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    
}
