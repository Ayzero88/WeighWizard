package com.weighwiz.weighwizbackend.scale;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.weighwiz.weighwizbackend.db.ScaleConfigService;
import com.weighwiz.weighwizbackend.db.ScaleParamRepository;
import com.weighwiz.weighwizbackend.db.ScaleParamService;
import com.weighwiz.weighwizbackend.websocket.WeightWebSocketBroadcaster;

@Service
public class ScaleReaderManager {

    private final Map<String, ScaleReaderInstance> readers = new ConcurrentHashMap<>();

    @Autowired
    private ScaleConfigService configService;

    @Autowired
    private WeightWebSocketBroadcaster broadcaster;

    @Autowired
    private ScaleParamRepository repo;

    public void startAll() {
        for (ScaleParamService cfg : configService.getAllEnabledConfigs()) {
            readers.computeIfAbsent(cfg.getScaleId(), id -> {
                ScaleReaderInstance reader = new ScaleReaderInstance(id, () -> repo.findByScaleId(id).orElseThrow(), broadcaster);
                reader.start();
                return reader;
            });
        }
    }

    // Makes a scale drop its current connection and reconnect with its newly saved settings
    public void reconnect(String scaleId) {
        ScaleReaderInstance r = readers.get(scaleId);
        if (r != null) r.requestReconnect();
    }

    public void stop(String scaleId) {
        ScaleReaderInstance r = readers.get(scaleId);
        if (r != null) r.stop();
    }

    public void stopAll() {
        readers.values().forEach(ScaleReaderInstance::stop);
    }
}