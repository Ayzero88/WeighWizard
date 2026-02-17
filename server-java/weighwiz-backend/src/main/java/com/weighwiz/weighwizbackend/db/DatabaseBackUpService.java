package com.weighwiz.weighwizbackend.db;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class DatabaseBackUpService {
    private static final String PG_DUMP =
        "C:\\Program Files\\PostgreSQL\\15\\bin\\pg_dump.exe";

private static final String PG_RESTORE =
        "C:\\Program Files\\PostgreSQL\\15\\bin\\pg_restore.exe";


    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    @Value("${backup.folder:./backups}")
    private String backupFolder;

    private String getDbName() {
        return dbUrl.substring(dbUrl.lastIndexOf("/") + 1);
    }

public String backupFullDatabase() throws IOException, InterruptedException {

        // ✅ ensure /full folder exists
    File fullDir = new File(backupFolder + File.separator + "full");
    if (!fullDir.exists()) {
        fullDir.mkdirs();
    }

    String fileName = "full_backup_" + System.currentTimeMillis() + ".dump";
    String filePath = fullDir.getAbsolutePath() + File.separator + fileName;

    ProcessBuilder pb = new ProcessBuilder(
            PG_DUMP,
            "-h", "localhost",
            "-U", dbUser,
            "-d", getDbName(),
            "-F", "c",
            "-f", filePath
    );

    // 🔑 password
    pb.environment().put("PGPASSWORD", dbPassword);

    // ⭐ IMPORTANT
    pb.redirectErrorStream(true);

    Process process = pb.start();

    // 🔍 READ ALL OUTPUT
    try (BufferedReader reader = new BufferedReader(
            new InputStreamReader(process.getInputStream()))) {

        String line;
        while ((line = reader.readLine()) != null) {
            System.out.println("PG_DUMP >>> " + line);
        }
    }

    int exitCode = process.waitFor();

    System.out.println("PG_DUMP EXIT CODE = " + exitCode);

    if (exitCode != 0) {
        throw new IOException("Full database backup failed, exit code=" + exitCode);
    }

    return fileName;

}

public void restoreFullDatabase(String fileName)
        throws IOException, InterruptedException {

    String fullPath = backupFolder + File.separator + "full" + File.separator + fileName;

    ProcessBuilder pb = new ProcessBuilder(
            PG_RESTORE,
            "-h", "localhost",
            "-U", dbUser,
            "-d", getDbName(),
            "--clean",
            "--if-exists",
            fullPath
    );

    pb.environment().put("PGPASSWORD", dbPassword);
    pb.redirectErrorStream(true);

    Process process = pb.start();

    try (BufferedReader reader = new BufferedReader(
            new InputStreamReader(process.getInputStream()))) {
        String line;
        while ((line = reader.readLine()) != null) {
            System.out.println("PG_RESTORE >>> " + line);
        }
    }

    int exit = process.waitFor();
    if (exit != 0) {
        throw new IOException("Full restore failed, exit code=" + exit);
    }
}

public List<String> getFullBackupFiles() {
    File folder = new File(backupFolder + File.separator + "full");
    List<String> fullBackups = new ArrayList<>();

    if (folder.exists() && folder.isDirectory()) {
        File[] files = folder.listFiles((dir, name) ->
                name.startsWith("full_backup_") && name.endsWith(".dump")
        );

        if (files != null) {
            for (File file : files) {
                fullBackups.add(file.getName()); // ✅ NOT absolute path
            }
        }
    }

    return fullBackups;
}

}
