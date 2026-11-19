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

    public void broadcastWeight(String scaleId, String weight) {
        String json = String.format(
                "{\"type\":\"weight\",\"scaleId\":\"%s\",\"value\":\"%s\"}",
                scaleId, weight
        );
        send(json);
    }

    public void broadcastError(String scaleId, String message) {
        String json = String.format(
                "{\"type\":\"error\",\"scaleId\":\"%s\",\"message\":\"%s\"}",
                scaleId, escape(message)
        );
        send(json);
    }

    public void broadcastStatus(String scaleId, String status) {
        String json = String.format(
                "{\"type\":\"status\",\"scaleId\":\"%s\",\"message\":\"%s\"}",
                scaleId, escape(status)
        );
        send(json);
    }

    private String escape(String s) {
        return s == null ? "" : s.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private void send(String json) {
        TextMessage msg = new TextMessage(json);
        for (WebSocketSession session : sessions) {
            try {
                if (session.isOpen()) {
                    session.sendMessage(msg);
                }
            } catch (Exception e) {
                sessions.remove(session);
            }
        }
    }
}