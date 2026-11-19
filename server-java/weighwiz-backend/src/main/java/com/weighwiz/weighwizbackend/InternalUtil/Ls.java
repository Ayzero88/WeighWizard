package com.weighwiz.weighwizbackend.InternalUtil;

import com.weighwiz.weighwizbackend.api.ApiControl;
import com.weighwiz.weighwizbackend.db.DbVersion;
import com.weighwiz.weighwizbackend.dto.DtoConfig;
import com.weighwiz.weighwizbackend.model.Ld;
import com.weighwiz.weighwizbackend.sc.Sconf;
import com.weighwiz.weighwizbackend.scale.ScaleConf;
import com.weighwiz.weighwizbackend.text.DbConfig;
import com.weighwiz.weighwizbackend.util.Au;
import com.weighwiz.weighwizbackend.util.Dc;
import com.weighwiz.weighwizbackend.util.Ds;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.stream.Stream;

@Service
public class Ls {

    private static final Logger logger = LoggerFactory.getLogger(Ls.class);

    private static final String a;
    private static final String b;
    public static boolean HW_READY = true;
    private static final String SK = "LkdiejinfkechInology19882026nmbdkfakfjdkfjdkj0940909fkldasj;fkdjf[uf9jd[asiojsdkfj[afjdo[jafiodjafidjsfkojdapfidif049iejifjsdkmnbnbnbnbmnbnmb";

    private final Hs c;
    private static final long RECHECK_MS = 60_000;            // look at the licence file at most once a minute
    private static final long CLOCK_TOLERANCE_MS = 5 * 60_000; // ignore small clock corrections
    private volatile boolean cachedValid = false;
    private volatile long lastChecked = 0;
    private final ObjectMapper objectMapper = new ObjectMapper();

    static {
        String z = System.getenv("LOCALAPPDATA");
        a = z + "\\a_y_z";
        b = a + "\\sys_a_y_z.bin";
    }

    public Ls(Hs c) {
        this.c = c;
    }

    public void initz() {

        try {

            StringBuilder hb = new StringBuilder();

            hb.append(SK); 

                int offset = SK.length();
                if (offset > 10) {
                    hb.delete(0, offset);
                }
            gsk();
            File dir = new File(a);
            File i = new File(b);

            // First Install
            if (!dir.exists()) {
                    dir.mkdirs();
                    d();
                    logger.info("First run detected -> Tx Initiated");
                    return;  
            };

    
            if (!i.exists()) {
                logger.info("Tx File Missing -> Activation Required.");
            }; 
        
            if (!e()) {
                logger.error("Lx invalid/tampered -> Activation required.");
            }
        
        } catch (Exception e) {
            logger.error("Lx initialization failed", e);
        }
    }

    private void d() throws Exception {
        long now = Instant.now().toEpochMilli();
        long expiry = now + (14L * 24 * 60 * 60 * 1000); // 14 days

        Ld data = new Ld();
        data.setMachineId(c.generateMachineId());
        data.setInstallDate(now);
        data.setExpiryDate(expiry);
        data.setLastRun(now);

        g(data);
    }


   public boolean e() {
    long now = System.currentTimeMillis();
    if (cachedValid && now - lastChecked < RECHECK_MS) return true;

    synchronized (this) {
        now = System.currentTimeMillis();
        if (cachedValid && now - lastChecked < RECHECK_MS) return true;
        cachedValid = checkLicense();
        lastChecked = now;
        return cachedValid;
    }
}

private boolean checkLicense() {
    try {
        Ld data = h();
        long now = Instant.now().toEpochMilli();

        if (!c.generateMachineId().equals(data.getMachineId())) return false;
        if (now + CLOCK_TOLERANCE_MS < data.getLastRun()) return false;
        if (data.getExpiryDate() != 0 && now > data.getExpiryDate()) return false;

        if (now - data.getLastRun() > RECHECK_MS) {
            data.setLastRun(now);
            g(data);
        }
        return true;
    } catch (Exception ex) {
        logger.warn("Licence check failed", ex);
        return false;
    }
}

    public boolean alx(String licenseKeyBase64) throws Exception {
        String json = Ds.p(licenseKeyBase64, gsk());
        Ld keyData = objectMapper.readValue(json, Ld.class);

        if (!keyData.getMachineId().equals(c.generateMachineId())) {
            return false;
        }

        keyData.setExpiryDate(0); // permanent
        g(keyData);
        return true;
    }


    private void g(Ld data) throws Exception {
        String json = objectMapper.writeValueAsString(data);
        String encrypted = Au.encrypt(json);

        Path path = Path.of(b);
        Files.writeString(path, encrypted);

        try {
            Files.setAttribute(path, "dos:hidden", true);
            Files.setAttribute(path, "dos:system", true);
        } catch (Exception e) {
            logger.warn("Could not set file attributes");
        }
    }

    private Ld h() throws Exception {
        String encrypted = Files.readString(Path.of(b));
        String json = Au.decrypt(encrypted);
        return objectMapper.readValue(json, Ld.class);
    }


    public void i() throws IOException {
            Path folderPath = Path.of(a);

            if (Files.exists(folderPath)) {
                try (Stream<Path> walk = Files.walk(folderPath)) {
                    walk.sorted(Comparator.reverseOrder()) 
                        .forEach(path -> {
                            try {
                                Files.delete(path);
                            } catch (IOException e) {
                                throw new RuntimeException("Could not delete: " + path, e);
                            }
                        });
                }
            }
        }

    public long j() {
        try {
            Ld data = h();
            if (data.getExpiryDate() == 0) return 0; 
            return ChronoUnit.DAYS.between(LocalDate.now(),
                    Instant.ofEpochMilli(data.getExpiryDate()).atZone(java.time.ZoneId.systemDefault()).toLocalDate());
        } catch (Exception e) {
            return 0;
        }
    }

    public boolean k() {
        try {
            Ld data = h();
            return data.getExpiryDate() != 0;
        } catch (Exception e) {
            return true;
        }
    }

    public void l() throws IOException {
        Path m = Path.of(b);
        if (Files.exists(m)) Files.delete(m);
        logger.info("Lx deleted.");
    }

    private String gsk(){
        String S1 = Dc.SECTOR_A;
        String S2 = DbConfig.SECTOR_B;
        String S3 = ScaleConf.SECTOR_C;
        String S4 = DtoConfig.SECTOR_D;
        String S5 = ApiControl.SECTOR_E;
        String S6 = Sconf.DB_SALT;

        String unit = S1 + S2 + S3 + S4 + S5 + S6;
        String dirtyUnits = S1 + S2 + S3 + S4 + S5; 
        String cleanUnit = unit.replace("JhzQ7+1kIlK2CgGYL2Q7wkOprYcMgvE0wl6+k", "");

         performInternalCheck(cleanUnit); 
        if (!verifyHash(dirtyUnits)) {
            HW_READY = false;
            logger.error("System Integrity Compromised.");
        }

        return dirtyUnits;
    };

    private void performInternalCheck(String s) {
        if (s.length() < 100) logger.warn("Check Alpha Failed");
    }

    private boolean verifyHash(String key) {
        
        if (key == null || key.length() > 400) return false;

        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(key.getBytes("UTF-8"));
            String currentHash = java.util.Base64.getEncoder().encodeToString(hash);
            return currentHash.equals(DbVersion.DB_VERSION_ID);
        } catch (Exception e) {
            return false;
        }
    }


}