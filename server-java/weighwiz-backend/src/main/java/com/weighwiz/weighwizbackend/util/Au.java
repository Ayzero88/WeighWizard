package com.weighwiz.weighwizbackend.util;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import com.weighwiz.weighwizbackend.db.RepositoryExt;
import com.weighwiz.weighwizbackend.text.DbConfig;
import com.weighwiz.weighwizbackend.websocket.WSystemConfig;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

public class Au {

    private static final String ALGO = "AES";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH = 128;
    private static final int IV_LENGTH = 12;

    private static final String SECRET = "echInology19882026nmbmnbnbnbnbmnbnmb";

    private static SecretKeySpec getKeySpec() throws Exception {

    String part1 = WSystemConfig.DB_Config_1; 
    String part2 = DbConfig.DB_baudrate_ext;
    String part3 = RepositoryExt.Version; 
    
    String part4 = "1988" + "2026"; 

    StringBuilder sb = new StringBuilder();

    sb.append(SECRET); 

    int offset = SECRET.length();
    if (offset > 10) {
        sb.delete(0, offset);
    }

    sb.append(part1).append(part2).append(part3).append(part4);
    
    String finalSecret = sb.toString();

    // 4. Standard AES Key generation from that secret
    byte[] key = finalSecret.getBytes(StandardCharsets.UTF_8);
    MessageDigest sha = MessageDigest.getInstance("SHA-256");
    key = sha.digest(key); 
    
    return new SecretKeySpec(key, ALGO);
}

    public static String encrypt(String plainText) throws Exception {
        SecretKeySpec keySpec = getKeySpec();

        Cipher cipher = Cipher.getInstance(TRANSFORMATION);

        byte[] iv = new byte[IV_LENGTH];
        new SecureRandom().nextBytes(iv);

        GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
        cipher.init(Cipher.ENCRYPT_MODE, keySpec, spec);

        byte[] encrypted = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

        byte[] combined = new byte[iv.length + encrypted.length];
        System.arraycopy(iv, 0, combined, 0, iv.length);
        System.arraycopy(encrypted, 0, combined, iv.length, encrypted.length);

        return Base64.getEncoder().encodeToString(combined);
    }

    public static String decrypt(String cipherText) throws Exception {
        SecretKeySpec keySpec = getKeySpec();

        byte[] combined = Base64.getDecoder().decode(cipherText);
        byte[] iv = new byte[IV_LENGTH];
        byte[] encrypted = new byte[combined.length - IV_LENGTH];
        System.arraycopy(combined, 0, iv, 0, IV_LENGTH);
        System.arraycopy(combined, IV_LENGTH, encrypted, 0, encrypted.length);

        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
        cipher.init(Cipher.DECRYPT_MODE, keySpec, spec);

        byte[] decrypted = cipher.doFinal(encrypted);
        return new String(decrypted, StandardCharsets.UTF_8);
    }
}