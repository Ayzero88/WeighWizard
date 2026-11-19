package com.weighwiz.weighwizbackend.scale;

import java.io.IOException;
import java.io.InputStream;

import com.fazecast.jSerialComm.SerialPort;
import com.weighwiz.weighwizbackend.db.ScaleParamService;

public class SerialConnection implements ScaleConnection {

    private final ScaleParamService cfg;
    private SerialPort port;

    public SerialConnection(ScaleParamService cfg) {
        this.cfg = cfg;
    }

    @Override
    public boolean open() {
        port = SerialPort.getCommPort(cfg.getPort());
        port.setComPortParameters(cfg.getBaudRate(), cfg.getDatabits(), cfg.getStopbits(), mapParity(cfg.getParity()));
        port.setFlowControl(mapFlow(cfg.getFlowControl()));
        port.setComPortTimeouts(SerialPort.TIMEOUT_READ_SEMI_BLOCKING, 1000, 0);
        if (!port.openPort()) return false;
        port.flushIOBuffers();
        return true;
    }

    @Override
    public InputStream getInputStream() throws IOException {
        return port.getInputStream();
    }

    @Override
    public boolean isOpen() {
        return port != null && port.isOpen();
    }

    @Override
    public void close() {
        if (port != null && port.isOpen()) port.closePort();
    }

    @Override
    public String describe() {
        return cfg.getPort();
    }

    private int mapParity(String parity) {
        return switch (parity.toUpperCase()) {
            case "EVEN" -> SerialPort.EVEN_PARITY;
            case "ODD" -> SerialPort.ODD_PARITY;
            default -> SerialPort.NO_PARITY;
        };
    }

    private int mapFlow(String flow) {
        return switch (flow.toUpperCase()) {
            case "RTSCTS" -> SerialPort.FLOW_CONTROL_RTS_ENABLED;
            default -> SerialPort.FLOW_CONTROL_DISABLED;
        };
    }
}