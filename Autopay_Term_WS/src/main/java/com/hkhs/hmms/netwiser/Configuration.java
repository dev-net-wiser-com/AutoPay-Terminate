package com.hkhs.hmms.netwiser;

import java.nio.charset.Charset;
import org.springframework.core.env.Environment;

/** Compatibility adapter for the legacy upload path fallback. No Axis2 context. */
public final class Configuration {
    private static volatile Environment environment;
    public static void initialize(Environment value) { environment = value; }
    public Configuration(String ignoredLegacyResource) {}
    public String getValue(String key) {
        if (!"file.path".equals(key)) throw new IllegalArgumentException("Unsupported legacy setting: " + key);
        return current().getProperty("uploadFolder", "");
    }
    public static Charset fileCharset() {
        return Charset.forName(current().getRequiredProperty("autopay.file-charset"));
    }
    public static String autopayUploadRoot() {
        return current().getProperty("autopay.upload-root", "").trim();
    }
    public static String autopayProcessingRoot() {
        return current().getProperty("autopay.processing-root", "").trim();
    }
    private static Environment current() {
        if (environment == null) throw new IllegalStateException("AutoPay configuration has not been initialized");
        return environment;
    }
}
