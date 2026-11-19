package com.weighwiz.weighwizbackend.api;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.weighwiz.weighwizbackend.db.PrintTypeService;
import com.weighwiz.weighwizbackend.db.PrintTypeRepository;

@RestController
@RequestMapping("/print-type")
public class PrintTypeController {
    private final PrintTypeRepository repo;

    public PrintTypeController(PrintTypeRepository repo) {
        this.repo = repo;
    }

    public static class PrintTypeRequest {
        public String scaleId;          // "GATE_1" (default) or "GATE_2"
        public Boolean standard;
        public Boolean straight;
        public Integer adjustDecimal;
        public Double capacity;
        public Double resolution;
        public String edit;

        public PrintTypeRequest() {}
    }

    private String normalize(String scaleId) {
        if (scaleId == null || scaleId.isBlank()) return "GATE_1";
        if (!scaleId.equals("GATE_1") && !scaleId.equals("GATE_2")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown scale: " + scaleId);
        }
        return scaleId;
    }

    @PostMapping
    public Map<String, String> savePrintType(@RequestBody PrintTypeRequest body) {
        String scaleId = normalize(body.scaleId);

        String trueKey;
        String edit;

        if ("GATE_1".equals(scaleId)) {
            if (Boolean.TRUE.equals(body.standard)) {
                trueKey = "standard";
            } else if (Boolean.TRUE.equals(body.straight)) {
                trueKey = "straight";
            } else {
                throw new IllegalArgumentException("No print type selected");
            }
            edit = String.valueOf("true".equalsIgnoreCase(body.edit));
        } else {
            // Gate 2 shares the print type and edit setting with Gate 1
            PrintTypeService gate1 = repo.findByScaleId("GATE_1").orElseThrow(() ->
                new ResponseStatusException(HttpStatus.BAD_REQUEST, "Save Gate 1 settings first"));
            trueKey = gate1.getPtype();
            edit = gate1.getEdit();
        }

        int decimal = body.adjustDecimal != null ? body.adjustDecimal : 2;
        double capacity = body.capacity != null ? body.capacity : 0;
        double resolution = body.resolution != null ? body.resolution : 0;

        PrintTypeService existing = repo.findByScaleId(scaleId).orElse(null);

        if (existing != null
            && trueKey.equals(existing.getPtype())
            && decimal == existing.getAdjustedDecimal()
            && Double.compare(capacity, existing.getCapacity()) == 0
            && Double.compare(resolution, existing.getResolution()) == 0
            && edit.equals(existing.getEdit())) {

            return Map.of("message", "No changes to save", "status", "unchanged");
        }

        PrintTypeService printType = existing != null ? existing : new PrintTypeService();
        if (existing == null) {
            printType.setId("GATE_1".equals(scaleId) ? 1L : 2L);
        }
        printType.setScaleId(scaleId);
        printType.setPtype(trueKey);
        printType.setAdjustDecimal(decimal);
        printType.setCapacity(capacity);
        printType.setResolution(resolution);
        printType.setEdit(edit);

        repo.save(printType);

        return Map.of("message", "Print type saved successfully", "status", "saved");
    }

    @GetMapping
    public Map<String, Object> getPrintType(@RequestParam(required = false) String scaleId) {
        String id = normalize(scaleId);

        return repo.findByScaleId(id)
            .or(() -> repo.findByScaleId("GATE_1"))   // Gate 2 uses Gate 1's values until its own are saved
            .map(pt -> {
                Map<String, Object> map = new HashMap<>();
                map.put("ptype", pt.getPtype());
                map.put("adjustDecimal", pt.getAdjustedDecimal());
                map.put("capacity", pt.getCapacity());
                map.put("resolution", pt.getResolution());
                map.put("edit", pt.getEdit());
                return map;
            })
            .orElseGet(() -> {
                Map<String, Object> map = new HashMap<>();
                map.put("ptype", "");
                map.put("adjustDecimal", 0);
                map.put("capacity", 0);
                map.put("resolution", 0);
                map.put("edit", "false");
                return map;
            });
    }
}