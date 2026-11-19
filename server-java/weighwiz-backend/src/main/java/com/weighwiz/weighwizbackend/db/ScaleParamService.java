package com.weighwiz.weighwizbackend.db;

import jakarta.persistence.*;

@Entity
@Table(name = "scale_params")
public class ScaleParamService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "scale_id", nullable = false, unique = true)
    private String scaleId;

    @Column(name = "enabled", nullable = false)
    private Boolean enabled = true;

    @Column(name = "port", nullable = false)
    private String port;

    @Column(name = "baud_rate", nullable = false)   
    private Integer baudRate;

    @Column(name = "databits", nullable = false)
    private Integer databits;

    @Column(name = "stopbits", nullable = false)
    private Integer stopbits;

    @Column(name = "parity", nullable = false)
    private String parity;

    @Column(name = "flow_control", nullable = false)
    private String flowControl;

    @Column(name = "connection_type", nullable = false)
    private String connectionType = "SERIAL";

    @Column(name = "host")
    private String host;

    @Column(name = "tcp_port")
    private Integer tcpPort;

    //Constructors
    public ScaleParamService() {}

    public ScaleParamService(String scaleId, Boolean enabled, String port,
                              Integer baudRate, Integer databits, Integer stopbits,
                              String parity, String flowControl) {
        this.scaleId = scaleId;
        this.enabled = enabled;
        this.port = port;
        this.baudRate = baudRate;
        this.databits = databits;
        this.stopbits = stopbits;
        this.parity = parity;
        this.flowControl = flowControl;
    }

    //Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getScaleId() { return scaleId; }
    public void setScaleId(String scaleId) { this.scaleId = scaleId; }

    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }

    public String getPort() { return port; }
    public void setPort(String port) { this.port = port; }

    public Integer getBaudRate() { return baudRate; }
    public void setBaudRate(Integer baudRate) { this.baudRate = baudRate; }

    public Integer getDatabits() { return databits; }
    public void setDatabits(Integer databits) { this.databits = databits; }

    public Integer getStopbits() { return stopbits; }
    public void setStopbits(Integer stopbits) { this.stopbits = stopbits; }

    public String getParity() { return parity; }
    public void setParity(String parity) { this.parity = parity; }

    public String getFlowControl() { return flowControl; }
    public void setFlowControl(String flowControl) { this.flowControl = flowControl; }

    public String getConnectionType() { return connectionType; }
    public void setConnectionType(String connectionType) { this.connectionType = connectionType; }

    public String getHost() { return host; }
    public void setHost(String host) { this.host = host; }

    public Integer getTcpPort() { return tcpPort; }
    public void setTcpPort(Integer tcpPort) { this.tcpPort = tcpPort; }
}