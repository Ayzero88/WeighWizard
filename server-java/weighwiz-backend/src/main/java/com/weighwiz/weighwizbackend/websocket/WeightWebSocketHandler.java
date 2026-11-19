package com.weighwiz.weighwizbackend.websocket;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import com.weighwiz.weighwizbackend.scale.ScaleReaderManager;


@Component
public class WeightWebSocketHandler extends TextWebSocketHandler {

    @Autowired
    private WeightWebSocketBroadcaster broadcaster;

    @Autowired
    private ScaleReaderManager readerManager;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        broadcaster.add(session);
        readerManager.startAll(); // starts once, background thread
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        broadcaster.remove(session);
    }
}

