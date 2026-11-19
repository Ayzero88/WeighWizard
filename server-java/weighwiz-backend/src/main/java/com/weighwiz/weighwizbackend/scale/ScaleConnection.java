package com.weighwiz.weighwizbackend.scale;

import java.io.IOException;
import java.io.InputStream;

public interface ScaleConnection {
    boolean open() throws Exception;      // false = could not open
    InputStream getInputStream() throws IOException;
    boolean isOpen();
    void close();
    String describe();                    // "COM4" or "192.168.1.50:4001"
}