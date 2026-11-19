package com.weighwiz.weighwizbackend.api;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.weighwiz.weighwizbackend.InternalUtil.Hs;
import com.weighwiz.weighwizbackend.InternalUtil.Ls;

@RestController
@RequestMapping("/l")
public class Lc {

    private final Ls a;
    private final Hs b;

    public Lc(Ls a, Hs b) {
        this.a = a;
        this.b = b;
    }

   @GetMapping("/status")
    public Map<String, Object> getStatus() {

        boolean valid = a.e();
        long daysRemaining = a.j();
        boolean trial = a.k();

        Map<String, Object> response = new HashMap<>();
        response.put("valid", valid);
        response.put("daysRemaining", daysRemaining);
        response.put("trial", trial);

        return response;
    }

   @PostMapping("/activate")
    public ResponseEntity<String> activate(@RequestBody String licenseKey) {
        try {
            boolean success = a.alx(licenseKey);

            if (success) {
                return ResponseEntity.ok("activated");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("invalid key");
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("error: " + e.getMessage());
        }
    }

    @GetMapping("/machine-id")
    public String getMachineId() {
        return b.generateMachineId();
    }

  
}
