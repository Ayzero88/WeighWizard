package com.weighwiz.weighwizbackend.db;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DeletedTransactionRepository 
        extends JpaRepository<DeletedTransaction, Long> {
}
