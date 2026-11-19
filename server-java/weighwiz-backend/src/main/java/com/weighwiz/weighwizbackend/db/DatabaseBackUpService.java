package com.weighwiz.weighwizbackend.db;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.weighwiz.weighwizbackend.InternalUtil.Ls;

import java.io.*;
import java.util.ArrayList;
import java.util.List;


@Service
public class DatabaseBackUpService {
    private static final String PG_DUMP =
        "C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dump.exe";

    private static final String PG_RESTORE =
        "C:\\Program Files\\PostgreSQL\\17\\bin\\pg_restore.exe";

    private static final Logger logger = LoggerFactory.getLogger(Ls.class);


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

    String timestamp = java.time.LocalDateTime.now()
    .format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss"));

    String fileName = "full_backup_" + timestamp + ".dump";
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

 public List<String> getFullBackupFilesByMonth(String month) {

    File folder = new File(
        backupFolder + File.separator + "full"
    );

    List<String> fullBackupsByMonth = new ArrayList<>();

    if (folder.exists() && folder.isDirectory()) {

        File[] files = folder.listFiles((dir, name) ->
            name.startsWith("full_backup_") &&
            name.endsWith(".dump") &&
            (month == null || month.isBlank() || name.startsWith("full_backup_" + month))
        );

        if (files != null) {

            for (File file : files) {
                fullBackupsByMonth.add(file.getName());
            }
        }
    }

    return fullBackupsByMonth;
}


 @Scheduled(cron = "${backup.schedule.cron:0 0 2 * * SUN}")
//  @Scheduled(cron = "${backup.schedule.cron:*/5 * * * * *}")
    public void scheduledWeeklyBackup() {
        try {
            String result = backupFullDatabase();
            logger.info("Scheduled weekly backup completed: {}", result);
        } catch (Exception e) {
            logger.error("Scheduled weekly backup FAILED", e);
        }
    }
}
