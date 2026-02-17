package com.weighwiz.weighwizbackend.db;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ScaleConfigService {

    @Autowired
    private ScaleParamRepository repo;

    public ScaleParamService getActiveConfig() {
        return repo.findAll()
                   .stream()
                   .findFirst()
                   .orElseThrow(() ->
                       new RuntimeException("Scale parameters not configured"));
    }
}
