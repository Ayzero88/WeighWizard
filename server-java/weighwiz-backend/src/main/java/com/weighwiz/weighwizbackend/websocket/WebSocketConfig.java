package com.weighwiz.weighwizbackend.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final WeightWebSocketHandler weightWebSocketHandler;

    public WebSocketConfig(WeightWebSocketHandler weightWebSocketHandler) {
        this.weightWebSocketHandler = weightWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry
            .addHandler(weightWebSocketHandler, "/ws/weight")
            .setAllowedOrigins("*");
    }
}
