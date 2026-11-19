package com.weighwiz.weighwizbackend.db;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OwnersInfoRepository extends JpaRepository<OwnersInfoService, Long> {
}
