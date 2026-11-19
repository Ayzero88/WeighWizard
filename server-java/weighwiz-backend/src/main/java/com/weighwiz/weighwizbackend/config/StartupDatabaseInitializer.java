package com.weighwiz.weighwizbackend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.weighwiz.weighwizbackend.InternalUtil.Ls;
import com.weighwiz.weighwizbackend.db.DatabaseInitService;
import com.weighwiz.weighwizbackend.db.UserRepository;
import com.weighwiz.weighwizbackend.db.UserService;

import jakarta.annotation.PostConstruct;

@Component
public class StartupDatabaseInitializer {

    private static final Logger logger = LoggerFactory.getLogger(StartupDatabaseInitializer.class);
    private final DatabaseInitService initService;
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final Ls i;

    public StartupDatabaseInitializer(DatabaseInitService initService,  
                                      UserRepository userRepo,
                                      PasswordEncoder passwordEncoder,
                                      Ls i
                                    ) {
        this.initService = initService;
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.i = i;
    }

     @PostConstruct
    public void init() {

        // 🔐 Initialize license first
        i.initz();

        // 🗄 Then initialize database
        initService.createTables();

        if (!userRepo.existsByUsername("dev")) {
            UserService superUser = new UserService();
            superUser.setUsername("dev");
            superUser.setPassword(passwordEncoder.encode("4522"));
            superUser.setRole("superadmin");

            userRepo.save(superUser);
            logger.info("Superuser created: dev / 4522");
        } else {
            logger.info("Superuser already exists, skipping creation");
        }
    }


}

