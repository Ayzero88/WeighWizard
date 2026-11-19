package com.weighwiz.weighwizbackend.db;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ScaleParamRepository extends JpaRepository<ScaleParamService, Long> {

    List<ScaleParamService> findByEnabledTrue();
    Optional<ScaleParamService> findByScaleId(String scaleId);
}