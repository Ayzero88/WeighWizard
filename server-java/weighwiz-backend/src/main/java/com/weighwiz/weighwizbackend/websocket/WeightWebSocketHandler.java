package com.weighwiz.weighwizbackend.websocket;

import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Random;
import java.util.concurrent.*;

public class WeightWebSocketHandler extends TextWebSocketHandler {

    private ScheduledExecutorService scheduler;
    private ScheduledFuture<?> task;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        scheduler = Executors.newSingleThreadScheduledExecutor();

        task = scheduler.scheduleAtFixedRate(() -> {
            try {
                double weight = 500 + new Random().nextDouble() * 1500;
                session.sendMessage(new TextMessage(String.format("%.2f", weight)));
            } catch (Exception e) {
                stop();
            }
        }, 0, 1, TimeUnit.SECONDS);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        stop();
    }

    private void stop() {
        if (task != null) task.cancel(true);
        if (scheduler != null) scheduler.shutdown();
    }
}
