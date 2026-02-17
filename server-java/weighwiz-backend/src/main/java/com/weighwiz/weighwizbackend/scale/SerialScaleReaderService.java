package com.weighwiz.weighwizbackend.scale;

import java.util.Scanner;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fazecast.jSerialComm.SerialPort;
import com.weighwiz.weighwizbackend.db.ScaleConfigService;
import com.weighwiz.weighwizbackend.db.ScaleParamService;
import com.weighwiz.weighwizbackend.websocket.WeightWebSocketBroadcaster;

@Service
public class SerialScaleReaderService {

    private SerialPort port;
    private ExecutorService executor = Executors.newSingleThreadExecutor();
    private volatile boolean running = false;

    @Autowired
    private ScaleConfigService paramLoader;

    @Autowired
    private WeightWebSocketBroadcaster broadcaster;

    public void start() {
        ScaleParamService p = paramLoader.getActiveConfig();

        port = SerialPort.getCommPort(p.getPort());
        port.setComPortParameters(
                p.getBaudRate(),
                p.getDatabits(),
                p.getStopbits(),
                mapParity(p.getParity())
        );
        port.setFlowControl(mapFlow(p.getFlowControl()));
        port.setComPortTimeouts(
                SerialPort.TIMEOUT_READ_SEMI_BLOCKING, 1000, 0
        );

        if (!port.openPort()) {
            throw new RuntimeException("Failed to open serial port");
        }

        running = true;

        executor.submit(() -> {
            try (Scanner scanner = new Scanner(port.getInputStream())) {
                while (running && scanner.hasNextLine()) {
                    String raw = scanner.nextLine();
                    String weight = parseWeight(raw);

                    if (weight != null) {
                        broadcaster.broadcast(weight);
                    }
                }
            }
        });
    }

    public void stop() {
        running = false;
        if (port != null) port.closePort();
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

    private String parseWeight(String raw) {
        // Example input: "WT: 1234.56 kg"
        raw = raw.replaceAll("[^0-9.]", "");
        return raw.isEmpty() ? null : raw;
    }
}
