package com.weighwiz.weighwizbackend.db;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrintTypeRepository extends JpaRepository<PrintTypeService, Long> {
    // You can add custom queries if needed later  
};
