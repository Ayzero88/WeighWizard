package com.weighwiz.weighwizbackend;

// import java.io.File;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling 
public class WeighwizBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(WeighwizBackendApplication.class, args);
    }

    
    // public static void main(String[] args) {

    //     // Optional tmp folder
    //     new File(System.getProperty("user.dir") + File.separator + "tmp").mkdirs();

    //     // ────────────── SIMPLE DIRECT PATH (for VS Code Run button) ──────────────
    //     String manualDllFolder = System.getProperty("user.dir") + File.separator + "jsc_dll";

    //     File dllFolder = new File(manualDllFolder);
    //     if (dllFolder.exists() && new File(dllFolder, "jSerialComm.dll").exists()) {
    //         System.setProperty("jSerialComm.library.path", dllFolder.getAbsolutePath());
    //         System.out.println("✅ jSerialComm DLL loaded from: " + dllFolder.getAbsolutePath());
    //     } else {
    //         System.err.println("⚠️ jsc_dll folder NOT found!");
    //         System.err.println("Expected: " + dllFolder.getAbsolutePath());
    //     }

    //     SpringApplication.run(WeighwizBackendApplication.class, args);
    // }


}