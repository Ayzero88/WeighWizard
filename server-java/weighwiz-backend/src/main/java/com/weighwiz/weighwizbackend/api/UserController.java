package com.weighwiz.weighwizbackend.api;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.weighwiz.weighwizbackend.db.AuditLog;
import com.weighwiz.weighwizbackend.db.AuditLogRepository;
import com.weighwiz.weighwizbackend.db.UserRepository;
import com.weighwiz.weighwizbackend.db.UserService;
import com.weighwiz.weighwizbackend.dto.LoginRequest;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

     private final UserRepository repo;
     private final PasswordEncoder passwordEncoder;
     private final AuditLogRepository auditRepo;
     private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    public UserController(UserRepository repo, PasswordEncoder passwordEncoder, AuditLogRepository auditRepo) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
        this.auditRepo = auditRepo;
    }

    private void logAudit(String action, String performedBy, String target) {
    AuditLog audit = new AuditLog();
    audit.setAction(action);
    audit.setPerformedBy(performedBy);
    audit.setTarget(target);
    auditRepo.save(audit);
}

    @PostMapping
    public UserService createUser(@RequestBody UserService user, HttpServletRequest request) {
        try {
            // Encode the password
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            UserService saved = repo.save(user);
            String currentUser = request.getHeader("X-USER");
            if (currentUser == null || currentUser.isBlank()) {
                currentUser = "SYSTEM";
            }
            logAudit("CREATE_USER", currentUser, saved.getUsername());
            logger.info("User {} created by {}", saved.getUsername(), currentUser);


            return saved;
        } catch (DataIntegrityViolationException e) {
            e.printStackTrace(); //
            logger.error("Username conflict: {}", user.getUsername(), e);
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }  
    }

    @PostMapping("/login")
    public UserService login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {

        try {
                // Find user by username
                UserService user = repo.findByUsername(request.getUsername())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password"));

                // Check password
                if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
                }

                logger.info("Successful login: {}", user.getUsername());
                logAudit("LOGIN_SUCCESS", user.getUsername(), user.getUsername());

                // Login successful
                return user; // Or return a DTO excluding password
        } catch (Exception ex) {
            logger.warn("Failed login attempt for username: {}", request.getUsername());
            logAudit("LOGIN_FAILED", request.getUsername(), request.getUsername());

            throw ex;
        }
          
    }

    @GetMapping
    public List<UserService> getAllUsers() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public UserService getUserById(@PathVariable Long id) {
        return repo.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
    @PutMapping("/{id}")
    public UserService updateUser(@PathVariable Long id, @RequestBody UserService updatedUser, HttpServletRequest request) {

        UserService existing = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));

        existing.setUsername(updatedUser.getUsername());
        existing.setRole(updatedUser.getRole());

        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
            existing.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

    UserService saved = repo.save(existing);
    String currentUser = request.getHeader("X-USER");
    if (currentUser == null || currentUser.isBlank()) {
        currentUser = "SYSTEM";
    }
    logAudit("UPDATE_USER", currentUser, saved.getUsername());

    logger.info("User updated: {}", saved.getUsername());


        return saved;
    }

    // Delete user
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id, HttpServletRequest request) {
        UserService existing = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        repo.delete(existing);
         String currentUser = request.getHeader("X-USER");
         if (currentUser == null || currentUser.isBlank()) {
            currentUser = "SYSTEM";
        }
        logAudit("DELETE_USER", currentUser, existing.getUsername());

        logger.warn("User deleted: {}", existing.getUsername());
        }
}
