package com.weighwiz.weighwizbackend.model;

public class Ld {

    private String machineId;
    private long installDate;
    private long expiryDate;
    private long lastRun;

    public String getMachineId() { return machineId; }
    public void setMachineId(String machineId) { this.machineId = machineId; }

    public long getInstallDate() { return installDate; }
    public void setInstallDate(long installDate) { this.installDate = installDate; }

    public long getExpiryDate() { return expiryDate; }
    public void setExpiryDate(long expiryDate) { this.expiryDate = expiryDate; }

    public long getLastRun() { return lastRun; }
    public void setLastRun(long lastRun) { this.lastRun = lastRun; }
}
