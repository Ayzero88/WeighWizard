package com.weighwiz.weighwizbackend.api;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.weighwiz.weighwizbackend.db.ScaleParamService;
import com.weighwiz.weighwizbackend.db.ScaleParamRepository;

@RestController
@RequestMapping("/scale")
public class ScaleParamController {

    private final ScaleParamRepository repo;

    public ScaleParamController(ScaleParamRepository repo) {
        this.repo = repo;
    }

    // Get all scale params
    @GetMapping
    public List<ScaleParamService> getAll() {
        return repo.findAll();
    }

    // Create new scale param
    @PostMapping
    public ScaleParamService create(@RequestBody ScaleParamService sp) {
        return repo.save(sp);
    }

    // Update existing scale param
    @PutMapping("/{id}")
    public ScaleParamService update(@PathVariable Long id, @RequestBody ScaleParamService sp) {
        ScaleParamService existing = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Scale config not found"));

        existing.setPort(sp.getPort());
        existing.setBaudRate(sp.getBaudRate());
        existing.setDatabits(sp.getDatabits());
        existing.setStopbits(sp.getStopbits());
        existing.setParity(sp.getParity());
        existing.setFlowControl(sp.getFlowControl());

        return repo.save(existing);
    }

    // Delete scale param
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        ScaleParamService existing = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Scale config not found"));

        repo.delete(existing);
        return "Scale configuration deleted successfully";
    }
}
