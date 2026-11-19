package com.weighwiz.weighwizbackend.text;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.weighwiz.weighwizbackend.InternalUtil.Hs;


    @RestController
    @RequestMapping("/test")
    public class TestController {

        private final Hs hardwareService;

        public TestController(Hs hardwareService) {
            this.hardwareService = hardwareService;
        }

    @GetMapping("/machine-id")
    public String getMachineId() {
        return hardwareService.generateMachineId();
    }
}
