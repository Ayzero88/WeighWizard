package com.weighwiz.weighwizbackend.api;

import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.weighwiz.weighwizbackend.db.UserRepository;
import com.weighwiz.weighwizbackend.db.UserService;

@RestController
@RequestMapping("/users")
public class UserController {

     private final UserRepository repo;

    public UserController(UserRepository repo) {
        this.repo = repo;
    }

    @PostMapping
    public UserService createUser(@RequestBody UserService user) {
        try {
            return repo.save(user);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
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
    
     //  Update user
     @PutMapping("/{id}")
    public UserService updateUser(@PathVariable Long id, @RequestBody UserService updatedUser) {
        UserService existing = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));

        existing.setUsername(updatedUser.getUsername());
        existing.setPassword(updatedUser.getPassword());
        existing.setRole(updatedUser.getRole());

        return repo.save(existing);
    }

    // Delete user
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        UserService existing = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        repo.delete(existing);
    }
}
