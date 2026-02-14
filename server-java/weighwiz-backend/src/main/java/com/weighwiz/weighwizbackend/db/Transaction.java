package com.weighwiz.weighwizbackend.db;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "transact")
public class Transaction {

    @Id
    @Column(name = "tid")
    private String tid;

    @Column(name = "first_weight")
    private Double firstWeight;

    @Column(name = "last_weight")
    private Double lastWeight;

    @Column(name = "tare_weight")
    private Double tareWeight;

    @Column(name = "net_weight")
    private Double netWeight;

    @Column(name = "gross_weight")
    private Double grossWeight;

    @Column(name = "company")
    private String company;

    @Column(name = "address")
    private String address;

    @Column(name = "product")
    private String product;

    @Column(name = "carrier")
    private String carrier;

    @Column(name = "operator")
    private String operator;

    @Column(name = "dest")
    private String dest;

    @Column(name = "tel")
    private String tel;

    @Column(name = "vehicle_no")
    private String vehicleNo;

    @Column(name = "batch_no")
    private String batchNo;

    @Column(name = "ops_type")
    private String opsType;

    @Column(name = "unit")
    private String unit;

    @Column(name = "fw_date")
    private OffsetDateTime fwDate;

    @Column(name = "sw_date")
    private OffsetDateTime swDate;

    @Column(name = "tw_date")
    private OffsetDateTime twDate;

    @Column(name = "nw_date")
    private OffsetDateTime nwDate;

    @Column(name = "gw_date")
    private OffsetDateTime gwDate;

    @Column(name = "capdate")
    private OffsetDateTime capDate;

    // Getters & Setters for all fields

@Override
public String toString() {
    return "Transaction{" +
            "tid='" + tid + '\'' +
            ", firstWeight=" + firstWeight +
            ", lastWeight=" + lastWeight +
            ", netWeight=" + netWeight +
            ", swDate=" + swDate +
            ", nwDate=" + nwDate +
            ", company='" + company + '\'' +
            ", product='" + product + '\'' +
            ", vehicleNo='" + vehicleNo + '\'' +
            '}';
}


    public String getTid() {
        return tid;
    }

    public void setTid(String tid) {
        this.tid = tid;
    }

    public Double getFirstWeight() {
        return firstWeight;
    }

    public void setFirstWeight(Double firstWeight) {
        this.firstWeight = firstWeight;
    }

    public Double getLastWeight() {
        return lastWeight;
    }

    public void setLastWeight(Double lastWeight) {
        this.lastWeight = lastWeight;
    }

    public Double getTareWeight() {
        return tareWeight;
    }

    public void setTareWeight(Double tareWeight) {
        this.tareWeight = tareWeight;
    }

    public Double getNetWeight() {
        return netWeight;
    }

    public void setNetWeight(Double netWeight) {
        this.netWeight = netWeight;
    }

    public Double getGrossWeight() {
        return grossWeight;
    }

    public void setGrossWeight(Double grossWeight) {
        this.grossWeight = grossWeight;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getProduct() {
        return product;
    }

    public void setProduct(String product) {
        this.product = product;
    }

    public String getCarrier() {
        return carrier;
    }

    public void setCarrier(String carrier) {
        this.carrier = carrier;
    }

    public String getOperator() {
        return operator;
    }

    public void setOperator(String operator) {
        this.operator = operator;
    }

    public String getDest() {
        return dest;
    }

    public void setDest(String dest) {
        this.dest = dest;
    }

    public String getTel() {
        return tel;
    }

    public void setTel(String tel) {
        this.tel = tel;
    }

    public String getVehicleNo() {
        return vehicleNo;
    }

    public void setVehicleNo(String vehicleNo) {
        this.vehicleNo = vehicleNo;
    }

    public String getBatchNo() {
        return batchNo;
    }

    public void setBatchNo(String batchNo) {
        this.batchNo = batchNo;
    }

    public String getOpsType() {
        return opsType;
    }

    public void setOpsType(String opsType) {
        this.opsType = opsType;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public OffsetDateTime getFwDate() {
        return fwDate;
    }

    public void setFwDate(OffsetDateTime fwDate) {
        this.fwDate = fwDate;
    }

    public OffsetDateTime getSwDate() {
        return swDate;
    }

    public void setSwDate(OffsetDateTime swDate) {
        this.swDate = swDate;
    }

    public OffsetDateTime getTwDate() {
        return twDate;
    }

    public void setTwDate(OffsetDateTime twDate) {
        this.twDate = twDate;
    }

    public OffsetDateTime getNwDate() {
        return nwDate;
    }

    public void setNwDate(OffsetDateTime nwDate) {
        this.nwDate = nwDate;
    }

    public OffsetDateTime getGwDate() {
        return gwDate;
    }

    public void setGwDate(OffsetDateTime gwDate) {
        this.gwDate = gwDate;
    }

    public OffsetDateTime getCapDate() {
        return capDate;
    }

    public void setCapDate(OffsetDateTime capDate) {
        this.capDate = capDate;
    }
}
