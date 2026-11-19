package com.weighwiz.weighwizbackend.InternalUtil;



import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.NetworkInterface;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Collections;
import java.util.Enumeration;

import org.springframework.stereotype.Service;


@Service
public class Hs {

  public String generateMachineId (){
     try{
        
        String cpu = getCommandOutput("wmic cpu get processorid");
        String board = getCommandOutput("wmic baseboard get serialnumber");
        String disk = getCommandOutput("wmic diskdrive get serialnumber");
        String mac = getMacAddress();

        String combined = cpu + board + disk + mac;

        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(combined.getBytes(StandardCharsets.UTF_8));

        return bytesToHex(hash);
     }catch(Exception e){
        throw new RuntimeException("Failed to generate machine ID", e);
    }

}
     private String getCommandOutput(String command) throws Exception {

            ProcessBuilder builder = new ProcessBuilder("cmd.exe", "/c", command);
            builder.redirectErrorStream(true);

            Process process = builder.start();

            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));

            return reader.lines()
                    .skip(1)
                    .findFirst()
                    .orElse("")
                    .trim();
     }
    

    private String getMacAddress() throws Exception {
        Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();

        for (NetworkInterface ni : Collections.list(interfaces)) {
            if (!ni.isLoopback() && ni.getHardwareAddress() != null) {
                byte[] mac = ni.getHardwareAddress();
                StringBuilder sb = new StringBuilder();
                for (byte b : mac) {
                    sb.append(String.format("%02X", b));
                }
                return sb.toString();
            }
        }
        return "";
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
    
}
