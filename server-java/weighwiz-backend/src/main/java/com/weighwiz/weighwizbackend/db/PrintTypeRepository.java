package com.weighwiz.weighwizbackend.db;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrintTypeRepository extends JpaRepository<PrintTypeService, Long> {
    Optional<PrintTypeService> findByScaleId(String scaleId);
};
