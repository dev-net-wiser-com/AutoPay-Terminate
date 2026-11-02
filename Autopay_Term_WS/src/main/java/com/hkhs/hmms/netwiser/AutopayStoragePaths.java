package com.hkhs.hmms.netwiser;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/** Upload roots can belong to a different OS; only the processing path is a local Path. */
public final class AutopayStoragePaths {
    private AutopayStoragePaths() {}

    public static String rootDirectory(String root) {
        if (root == null || root.isBlank()) throw new IllegalArgumentException("Upload root is missing");
        String separator = root.contains("/") ? "/" : "\\";
        return root.endsWith(separator) ? root : root + separator;
    }

    public static String moduleDirectory(String root, String screenId, String refId) {
        for (String part : new String[] { screenId, refId }) {
            if (part == null || !part.matches("[A-Za-z0-9_.-]+") || part.equals(".") || part.equals("..")) {
                throw new IllegalArgumentException("Invalid module path segment");
            }
        }
        String separator = root.contains("/") ? "/" : "\\";
        return rootDirectory(root) + screenId + separator + refId + separator;
    }

    public static void filename(String name) {
        if (name == null || name.isBlank() || name.equals(".") || name.equals("..") ||
                name.matches(".*[\\\\/:\\r\\n].*")) {
            throw new IllegalArgumentException("Invalid attachment filename");
        }
    }

    public static Path resolveFile(String directory, String storedName) throws IOException {
        filename(storedName);
        Path root = Path.of(directory);
        if (!root.isAbsolute()) throw new IOException("Processing directory must be an absolute local path");
        root = root.toRealPath();
        Path file = root.resolve(storedName).toRealPath();
        if (!file.startsWith(root) || !Files.isRegularFile(file)) {
            throw new IOException("Attachment is outside the configured processing directory or is not a regular file");
        }
        return file;
    }
}
