package com.weighwiz.weighwizbackend.api;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.weighwiz.weighwizbackend.auth.JwtService;
import com.weighwiz.weighwizbackend.db.AuditLog;
import com.weighwiz.weighwizbackend.db.AuditLogRepository;
import com.weighwiz.weighwizbackend.db.UserRepository;
import com.weighwiz.weighwizbackend.db.UserService;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository repo;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogRepository auditRepo;
    private final JwtService jwtService;

    public UserController(UserRepository repo, PasswordEncoder passwordEncoder, AuditLogRepository auditRepo, JwtService jwtService) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
        this.auditRepo = auditRepo;
        this.jwtService = jwtService;
    }

    private void logAudit(String action, String performedBy, String target) {
        AuditLog audit = new AuditLog();
        audit.setAction(action);
        audit.setPerformedBy(performedBy);
        audit.setTarget(target);
        auditRepo.save(audit);
    }

    private String currentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private String currentRole() {
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
            .findFirst().map(a -> a.getAuthority()).orElse("");
    }

    // Keep only known scale ids, stored comma-separated. Null or empty stays null (= all scales).
    private String normalizeScales(String scales) {
        if (scales == null || scales.isBlank()) {
            return null;
        }
        StringBuilder sb = new StringBuilder();
        for (String part : scales.split(",")) {
            String id = part.trim();
            if (id.equals("GATE_1") || id.equals("GATE_2") || id.equals("GATE_3") || id.equals("GATE_4")) {
                if (sb.length() > 0) sb.append(",");
                sb.append(id);
            }
        }
        return sb.length() == 0 ? null : sb.toString();
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('superadmin', 'admin')")
    public ResponseEntity<UserService> createUser(@RequestBody UserService user) {
        if (repo.existsByUsername(user.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }
        if ("admin".equals(currentRole()) && "superadmin".equals(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admins cannot create a superadmin");
        }
        user.setAllowedScales(normalizeScales(user.getAllowedScales()));
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        UserService saved = repo.save(user);
        logAudit("CREATE_USER", currentUsername(), user.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('superadmin', 'admin')")
    public List<UserService> getAllUsers() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('superadmin', 'admin')")
    public ResponseEntity<UserService> getUserById(@PathVariable Long id) {
        UserService user = repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('superadmin', 'admin')")
    public UserService updateUser(@PathVariable Long id, @RequestBody UserService userDetails) {
        UserService existing = repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if ("admin".equals(currentRole())) {
            if ("superadmin".equals(existing.getRole())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admins cannot change a superadmin");
            }
            if ("superadmin".equals(userDetails.getRole())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admins cannot make a user superadmin");
            }
            if (existing.getUsername().equals(currentUsername())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admins cannot change their own account");
            }
        }

        if (userDetails.getUsername() != null) {
            existing.setUsername(userDetails.getUsername());
        }

        if (userDetails.getPassword() != null && !userDetails.getPassword().isBlank()) {
            existing.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }

        if (userDetails.getRole() != null) {
            existing.setRole(userDetails.getRole());
        }

        if (userDetails.getAllowedScales() != null) {
            existing.setAllowedScales(normalizeScales(userDetails.getAllowedScales()));
        }

        UserService saved = repo.save(existing);
        logAudit("UPDATE_USER", currentUsername(), existing.getUsername());
        return saved;
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('superadmin', 'admin')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        UserService user = repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (user.getUsername().equals(currentUsername())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot delete your own account");
        }
        if ("admin".equals(currentRole()) && "superadmin".equals(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admins cannot delete a superadmin");
        }
        String username = user.getUsername();
        logAudit("DELETE_USER", currentUsername(), username);
        repo.delete(user);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest loginRequest) {
        UserService user = repo.findByUsername(loginRequest.getUsername())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }

        String token = jwtService.generateToken(user);
        logAudit("LOGIN", user.getUsername(), user.getUsername());
        return ResponseEntity.ok(Map.of("token", token, "user", user));
    }

    @GetMapping("/audit-logs")
    @PreAuthorize("hasAnyAuthority('superadmin', 'admin')")
    public List<AuditLog> getAuditLogs() {
        return auditRepo.findAll();
    }

    public static class LoginRequest {
        private String username;
        private String password;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}
