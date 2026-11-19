package com.weighwiz.weighwizbackend.scale;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.SocketTimeoutException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.Supplier;

import com.fazecast.jSerialComm.SerialPort;
import com.weighwiz.weighwizbackend.InternalUtil.Ls;
import com.weighwiz.weighwizbackend.db.ScaleParamService;
import com.weighwiz.weighwizbackend.websocket.WeightWebSocketBroadcaster;

public class ScaleReaderInstance {

    private final String scaleId;
    private final Supplier<ScaleParamService> configSupplier;
    private final WeightWebSocketBroadcaster broadcaster;

    private volatile ScaleConnection connection;
    private volatile boolean reconnectRequested = false;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final AtomicBoolean running = new AtomicBoolean(false);

    public ScaleReaderInstance(String scaleId, Supplier<ScaleParamService> configSupplier,
                               WeightWebSocketBroadcaster broadcaster) {
        this.scaleId = scaleId;
        this.configSupplier = configSupplier;
        this.broadcaster = broadcaster;
    }

    // Called after the settings are saved, so a new connection type or address applies at once
    public void requestReconnect() {
        reconnectRequested = true;
    }

    public void start() {
        if (!running.compareAndSet(false, true)) {
            System.out.println("Scale reader [" + scaleId + "] already running.");
            return;
        }

        executor.submit(() -> {
            while (running.get()) {
                try {
                    reconnectRequested = false;
                    ScaleParamService config = configSupplier.get();   // fresh from the database
                    connection = createConnection(config);

                    if (!connection.open()) {
                        String msg = "BLUETOOTH".equalsIgnoreCase(config.getConnectionType())
                                ? "Bluetooth scale not reachable. Check it is on, paired and in range. Retrying..."
                                : "Scale not connected. Retrying...";
                        broadcaster.broadcastError(scaleId, msg);
                        if (connection instanceof SerialConnection) broadcastAvailablePorts();
                        closeConnection();
                        Thread.sleep(3000);
                        continue;
                    }

                    broadcaster.broadcastStatus(scaleId, "Scale connected " + connection.describe());

                    readLoop(); // exits if the cable is removed or the network drops

                } catch (Exception e) {
                    broadcaster.broadcastError(scaleId, "Connection error: " + e.getMessage());
                }

                closeConnection();
                sleep(3000);
            }
        });
    }

    // Ethernet uses a network socket; Serial and Bluetooth both use a COM port
    private ScaleConnection createConnection(ScaleParamService cfg) {
        if ("TCP".equalsIgnoreCase(cfg.getConnectionType())) {
            return new TcpConnection(cfg.getHost(), cfg.getTcpPort());
        }
        return new SerialConnection(cfg);
    }

    private void broadcastAvailablePorts() {
        SerialPort[] ports = SerialPort.getCommPorts();
        if (ports.length == 0) {
            broadcaster.broadcastStatus(scaleId, "No serial ports detected");
            return;
        }

        StringBuilder sb = new StringBuilder("Available Ports:");
        for (SerialPort sp : ports) {
            sb.append(" - ").append(sp.getSystemPortName());
        }
        broadcaster.broadcastStatus(scaleId, sb.toString());
    }

    private void readLoop() {
        long lastDataTime = System.currentTimeMillis();

        if (!Ls.HW_READY) {
            broadcaster.broadcastWeight(scaleId, "HE");
            return;
        }

        ScaleConnection conn = connection;

        try (BufferedReader reader =
                new BufferedReader(new InputStreamReader(conn.getInputStream()))) {

            while (running.get() && !reconnectRequested && conn.isOpen()) {
                String line = null;
                boolean timedOut = false;

                try {
                    line = reader.readLine();
                } catch (SocketTimeoutException e) {
                    timedOut = true;   // Ethernet: nothing arrived within the read timeout
                }

                if (line != null) {
                    lastDataTime = System.currentTimeMillis();

                    Double weight = parseWeight(line);

                    if (weight != null) {
                        broadcaster.broadcastWeight(scaleId, weight.toString());
                    } else {
                        broadcaster.broadcastError(scaleId, "Invalid data from scale");
                    }
                } else if (!timedOut && conn instanceof TcpConnection) {
                    // Ethernet: a null line without a timeout means the other end closed the connection
                    broadcaster.broadcastError(scaleId, "Connection closed by the indicator. Reconnecting...");
                    return;
                } else if (System.currentTimeMillis() - lastDataTime > 5000) {
                    broadcaster.broadcastError(scaleId, "Scale connection lost. Reconnecting...");
                    return;
                }
            }
        } catch (Exception e) {
            broadcaster.broadcastError(scaleId, "Scale disconnected. Reconnecting...");
        }
    }

    private void closeConnection() {
        ScaleConnection c = connection;
        connection = null;
        if (c != null) c.close();
    }

    private void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    public void stop() {
        if (running.compareAndSet(true, false)) {
            broadcaster.broadcastStatus(scaleId, "Scale disconnected");
            System.out.println("Stopping scale reader [" + scaleId + "]...");
            closeConnection();
        }
    }

    private Double parseWeight(String raw) {
        if (raw == null || raw.isEmpty()) return null;

        java.util.regex.Matcher matcher =
                java.util.regex.Pattern.compile("\\d+(\\.\\d+)?").matcher(raw);

        if (matcher.find()) {
            try {
                return Double.parseDouble(matcher.group());
            } catch (NumberFormatException ignored) {
            }
        }
        return null;
    }
}