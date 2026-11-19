package com.weighwiz.weighwizbackend.db;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TransactionRepository extends JpaRepository<Transaction, String> {

    // Unfinished transactions
    List<Transaction> findByLastWeightIsNullAndNetWeightIsNull();

   @Query("SELECT t FROM Transaction t " +
       "WHERE (t.lastWeight IS NULL OR t.lastWeight = 0 " +
       "OR t.netWeight IS NULL OR t.netWeight = 0) " +
       "AND t.opsType = 'Standard'")
    List<Transaction> findUnfinishedTransactions();
    // search by tid
    Optional<Transaction> findByTid(String tid);

    // Search by vehicle, company, or tid
    List<Transaction> findByVehicleNoContainingIgnoreCaseOrCompanyContainingIgnoreCaseOrTidContainingIgnoreCase(
            String vehicleNo, String company, String tid
    );

     // 3️⃣ Filter by capDate range
    List<Transaction> findByCapDateBetween(OffsetDateTime start, OffsetDateTime end);
}
