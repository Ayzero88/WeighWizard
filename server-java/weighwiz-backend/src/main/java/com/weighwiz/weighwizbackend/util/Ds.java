package com.weighwiz.weighwizbackend.util;

import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import com.weighwiz.weighwizbackend.InternalUtil.Ls;

/**
 * Data Processing Utility
 */
public class Ds {

    // Process and extract metadata
    public static String p(String d, String m) throws Exception {
        try {
            byte[] b = Base64.getDecoder().decode(d);

     
            int sL = 256; 
            byte[] jB = new byte[b.length - sL];
            byte[] sB = new byte[sL];

            System.arraycopy(b, 0, jB, 0, jB.length);
            System.arraycopy(b, jB.length, sB, 0, sL);

    
            if (m == null || m.length() < 100) {
                 Ls.HW_READY = false; 
                 return "{\"err\":\"v_01\"}";
            }

            PublicKey pk = g(m);
            Signature s = Signature.getInstance("SHA256withRSA");
            s.initVerify(pk);
            s.update(jB);

          
            if (!s.verify(sB)) {
                Ls.HW_READY = false; 
             
                return "{\"status\":\"err_902\"}"; 
            }

            return new String(jB);
        } catch (Exception e) {
          
            Ls.HW_READY = false;
            throw new Exception("System core failure");
        }
    }

    // Load key metadata
    private static PublicKey g(String b) throws Exception {
        byte[] kB = Base64.getDecoder().decode(b);
        X509EncodedKeySpec s = new X509EncodedKeySpec(kB);
        return KeyFactory.getInstance("RSA").generatePublic(s);
    }
}
