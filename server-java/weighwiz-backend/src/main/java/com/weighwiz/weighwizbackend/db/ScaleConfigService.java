package com.weighwiz.weighwizbackend.db;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class ScaleConfigService {

    @Autowired
    private ScaleParamRepository repo;

    // Kept for now in case other code still depends on "just give me one config".
    // Once every caller is migrated to scale-aware methods below, this can be removed.
    public ScaleParamService getActiveConfig() {
        return repo.findAll()
                   .stream()
                   .findFirst()
                   .orElseThrow(() ->
                       new RuntimeException("Scale parameters not configured"));
    }

    // Used by ScaleReaderManager on startup — only scales marked enabled get a reader.
    public List<ScaleParamService> getAllEnabledConfigs() {
        return repo.findByEnabledTrue();
    }

}