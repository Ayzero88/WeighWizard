package com.weighwiz.weighwizbackend.websocket;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

@Component
public class WeightWebSocketBroadcaster {

    private final Set<WebSocketSession> sessions =
            ConcurrentHashMap.newKeySet();

    public void add(WebSocketSession session) {
        sessions.add(session);
    }

    public void remove(WebSocketSession session) {
        sessions.remove(session);
    }

    public void broadcast(String weight) {
        TextMessage msg = new TextMessage(weight);
        for (WebSocketSession s : sessions) {
            try {
                if (s.isOpen()) s.sendMessage(msg);
            } catch (Exception ignored) {}
        }
    }
}

