package com.weighwiz.weighwizbackend.db;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserService, Long> {
    Optional<UserService> findByUsername(String username);
    boolean existsByUsername(String username);
}
