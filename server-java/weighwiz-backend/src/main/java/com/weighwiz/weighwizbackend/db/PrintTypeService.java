package com.weighwiz.weighwizbackend.db;

import jakarta.persistence.*;

@Entity
@Table(name = "print_type")
public class PrintTypeService {

    @Id
    private Long id;   // always = 1

    @Column(nullable = false)
    private String ptype;

    @Column
    private Integer adjustDecimal;

    @Column
    private String edit;

    // ✅ Required by JPA
    public PrintTypeService() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPtype() {
        return ptype;
    }

    public void setPtype(String ptype) {
        this.ptype = ptype;
    }

    public Integer getAdjustedDecimal(){
        return adjustDecimal;
    }

    public void setAdjustDecimal(Integer adjustDecimal) {
        this.adjustDecimal = adjustDecimal;
    }

    public String getEdit() {
        return edit;
    }

    public void setEdit(String edit) {
        this.edit = edit;
    }
}
