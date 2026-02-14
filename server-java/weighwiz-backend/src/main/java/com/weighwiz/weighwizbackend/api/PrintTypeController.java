package com.weighwiz.weighwizbackend.api;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.weighwiz.weighwizbackend.db.PrintTypeService;
import com.weighwiz.weighwizbackend.db.PrintTypeRepository;

@RestController
@RequestMapping("/print-type")
public class PrintTypeController {
    private final PrintTypeRepository repo;

    public PrintTypeController(PrintTypeRepository repo){
        this.repo = repo;
    };

 public static class PrintTypeRequest {
        public Boolean standard;
        public Boolean straight;
        public Integer adjustDecimal;
        public String edit;

        // Optional: default constructor
        public PrintTypeRequest() {}
    }

@PostMapping
public Map<String, String> savePrintType(@RequestBody PrintTypeRequest body) {

     String trueKey;

    if (Boolean.TRUE.equals(body.standard)) {
        trueKey = "standard";
    } else if (Boolean.TRUE.equals(body.straight)) {
        trueKey = "straight";
    } else {
        throw new IllegalArgumentException("No print type selected");
    }

    PrintTypeService printType = repo.findById(1L)
        .orElseGet(() -> {
            PrintTypeService pt = new PrintTypeService();
            pt.setId(1L);
            return pt;
        });

    printType.setPtype(trueKey);
    printType.setAdjustDecimal(body.adjustDecimal != null ? body.adjustDecimal : 2);
    // Convert edit string ("true"/"false") to boolean
    boolean editFlag = "true".equalsIgnoreCase(body.edit);
    printType.setEdit(String.valueOf(editFlag));


    repo.save(printType);

    return Map.of("message", "Print type saved successfully");
}


@GetMapping
public Map<String, Object> getPrintType() {

    return repo.findById(1L)
        .map(pt -> {
            Map<String, Object> map = new HashMap<>();
            map.put("ptype", pt.getPtype());
            map.put("adjustDecimal", pt.getAdjustedDecimal());
            map.put("edit", pt.getEdit());
            return map;
        })
        .orElseGet(() -> {
            Map<String, Object> map = new HashMap<>();
            map.put("ptype", "");
            map.put("adjustDecimal", 2);
            map.put("edit", "false");
            return map;
        });
}





}
