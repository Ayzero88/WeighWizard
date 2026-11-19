package com.weighwiz.weighwizbackend.scale;

import java.io.IOException;
import java.io.InputStream;
import java.net.InetSocketAddress;
import java.net.Socket;

public class TcpConnection implements ScaleConnection {

    private final String host;
    private final Integer port;
    private Socket socket;

    public TcpConnection(String host, Integer port) {
        this.host = host;
        this.port = port;
    }

    @Override
    public boolean open() throws IOException {
        if (host == null || host.isBlank() || port == null || port < 1 || port > 65535) {
            throw new IOException("Ethernet address not set");
        }
        socket = new Socket();
        socket.connect(new InetSocketAddress(host, port), 3000);   // give up after 3 s
        socket.setSoTimeout(1000);                                 // same 1 s read timeout as serial
        socket.setKeepAlive(true);
        return true;
    }

    @Override
    public InputStream getInputStream() throws IOException {
        return socket.getInputStream();
    }

    @Override
    public boolean isOpen() {
        return socket != null && socket.isConnected() && !socket.isClosed();
    }

    @Override
    public void close() {
        try {
            if (socket != null) socket.close();
        } catch (IOException ignored) {
        }
    }

    @Override
    public String describe() {
        return host + ":" + port;
    }
}