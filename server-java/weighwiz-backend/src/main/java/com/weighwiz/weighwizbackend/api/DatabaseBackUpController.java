package com.weighwiz.weighwizbackend.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.weighwiz.weighwizbackend.db.DatabaseBackUpService;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/backup")
public class DatabaseBackUpController {

    @Autowired
    private DatabaseBackUpService backupService;


@PostMapping("/full-backup")
public String backupFullDatabase() throws IOException, InterruptedException {
    return backupService.backupFullDatabase();
}

@PostMapping("/full-restore")
public String restoreFullDatabase(@RequestParam String filePath) throws IOException, InterruptedException {
    backupService.restoreFullDatabase(filePath);
    return "Full database restored from: " + filePath;
}

@GetMapping("/full-backups")
public List<String> getFullBackups() {
    return backupService.getFullBackupFiles();
}



}
