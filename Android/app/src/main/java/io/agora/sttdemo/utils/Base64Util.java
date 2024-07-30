package io.agora.sttdemo.utils;

import android.util.Base64;

public class Base64Util {
    public static String encode(final String plainCredentials) {
        String base64Credentials  = Base64.encodeToString(plainCredentials.getBytes(), Base64.DEFAULT).replaceAll("\r|\n", "");
//        String base64Credentials = new String(java.util.Base64.getEncoder().encode(plainCredentials.getBytes()));
        // 创建 authorization header
        String authorizationHeader = "Basic " + base64Credentials;
        return authorizationHeader;
    }
}
