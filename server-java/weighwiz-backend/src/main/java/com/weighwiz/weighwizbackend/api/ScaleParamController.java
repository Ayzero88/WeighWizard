package com.weighwiz.weighwizbackend.api;

import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.weighwiz.weighwizbackend.db.ScaleParamService;
import com.weighwiz.weighwizbackend.db.ScaleParamRepository;
import com.weighwiz.weighwizbackend.scale.ScaleReaderManager;

import org.slf4j.LoggerFactory;
import org.slf4j.Logger;

@RestController
@RequestMapping("/scale")
public class ScaleParamController {

    private final ScaleParamRepository repo;
    private final ScaleReaderManager readerManager;
    private static final Logger logger = LoggerFactory.getLogger(ScaleParamController.class);

    public ScaleParamController(ScaleParamRepository repo, ScaleReaderManager readerManager) {
        this.repo = repo;
        this.readerManager = readerManager;
    }

    // Get all scale params (both gates, enabled or not — the config screen needs to see
    // a disabled Gate 2 in order to offer turning it on)
    @GetMapping
    public List<ScaleParamService> getAll() {
        return repo.findAll();
    }

    // Update an existing scale's connection settings.
    // 'enabled' is deliberately NOT accepted here: it is the paid-feature flag for the
    // second scale and may only be changed directly in the database.
    @PutMapping("/{id}")
    public Map<String, Object> update(
        @PathVariable Long id,
        @RequestBody ScaleParamService sp
    ) {
        ScaleParamService existing = repo.findById(id)
            .orElseThrow(() -> {
                logger.warn("Scale config not found: {}", id);
                return new ResponseStatusException(HttpStatus.NOT_FOUND, "Scale config not found");
            });

        // Serial, Ethernet (TCP) or Bluetooth; anything else is treated as Serial
        String requested = sp.getConnectionType() == null ? "SERIAL" : sp.getConnectionType().trim().toUpperCase();
        String type = switch (requested) {
            case "TCP" -> "TCP";
            case "BLUETOOTH" -> "BLUETOOTH";
            default -> "SERIAL";
        };

        String host = sp.getHost() == null ? "" : sp.getHost().trim();

        if (!host.isEmpty() && !host.matches("^[A-Za-z0-9.\\-]{1,253}$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a valid IP address or host name");
        }
        if ("TCP".equals(type)) {
            if (host.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter the indicator's IP address");
            }
            Integer p = sp.getTcpPort();
            if (p == null || p < 1 || p > 65535) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Port must be between 1 and 65535");
            }
        }

        String existingHost = existing.getHost() == null ? "" : existing.getHost();

        boolean unchanged =
            Objects.equals(existing.getPort(), sp.getPort()) &&
            Objects.equals(existing.getBaudRate(), sp.getBaudRate()) &&
            Objects.equals(existing.getDatabits(), sp.getDatabits()) &&
            Objects.equals(existing.getStopbits(), sp.getStopbits()) &&
            Objects.equals(existing.getParity(), sp.getParity()) &&
            Objects.equals(existing.getFlowControl(), sp.getFlowControl()) &&
            Objects.equals(existing.getConnectionType(), type) &&
            Objects.equals(existingHost, host) &&
            Objects.equals(existing.getTcpPort(), sp.getTcpPort());

        if (unchanged) {
            return Map.of(
                "status", "unchanged",
                "message", "No scale parameters were changed"
            );
        }

        existing.setPort(sp.getPort());
        existing.setBaudRate(sp.getBaudRate());
        existing.setDatabits(sp.getDatabits());
        existing.setStopbits(sp.getStopbits());
        existing.setParity(sp.getParity());
        existing.setFlowControl(sp.getFlowControl());
        existing.setConnectionType(type);
        existing.setHost(host.isEmpty() ? null : host);
        existing.setTcpPort(sp.getTcpPort());

        ScaleParamService saved = repo.save(existing);

        // make the running reader drop its connection and use the new settings straight away
        readerManager.reconnect(saved.getScaleId());

        logger.info("Scale config {} updated successfully", id);

        return Map.of(
            "status", "updated",
            "message", "Scale parameters updated successfully",
            "data", saved
        );
    }
}