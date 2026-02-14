package com.weighwiz.weighwizbackend.api;

import java.util.Base64;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.weighwiz.weighwizbackend.db.OwnersInfoRepository;
import com.weighwiz.weighwizbackend.db.OwnersInfoService;


@RestController
@RequestMapping("/ownerinfo")
public class OwnersInfoController {

    private final OwnersInfoRepository repo;

    public OwnersInfoController(OwnersInfoRepository repo) {
        this.repo = repo;
    }

    // Create owner
 @PostMapping
    public OwnersInfoService saveOwnerInfo(@RequestBody OwnersInfoService incoming) {

        OwnersInfoService owner = repo.findAll()
            .stream()
            .findFirst()
            .orElseGet(OwnersInfoService::new);

        owner.setOwner(incoming.getOwner());
        owner.setAddress(incoming.getAddress());
        owner.setTel(incoming.getTel());
        owner.setEmail(incoming.getEmail());
        owner.setLogo(incoming.getLogo());

        return repo.save(owner);
    }

    // Get owner info (singleton) ✅ returns Base64 for frontend
    @GetMapping
    public Map<String, String> getOwnerInfo() {
        OwnersInfoService owner = repo.findById(1L)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Owner info not initialized"
            ));

        String logoBase64 = owner.getLogo() != null 
            ? Base64.getEncoder().encodeToString(owner.getLogo()) 
            : "";

        return Map.of(
            "owner", owner.getOwner(),
            "address", owner.getAddress() != null ? owner.getAddress() : "",
            "tel", owner.getTel() != null ? owner.getTel() : "",
            "email", owner.getEmail() != null ? owner.getEmail() : "",
            "logo", logoBase64
        );
    }

    @PutMapping
    public OwnersInfoService updateOwner(@RequestBody OwnersInfoService incoming) {

        OwnersInfoService owner = repo.findById(1L)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Owner info not initialized"
            ));

        owner.setOwner(incoming.getOwner());
        owner.setAddress(incoming.getAddress());
        owner.setTel(incoming.getTel());
        owner.setEmail(incoming.getEmail());
        owner.setLogo(incoming.getLogo());

        return repo.save(owner);
    }

}
