package com.e_learning.validator.image;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

public class ImageValidator implements ConstraintValidator<ImageConstraint, MultipartFile> {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp"
    );
    private static final long MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB
    // Magic bytes: JPEG (FF D8 FF), PNG (89 50 4E 47), GIF (47 49 46), WEBP (52 49 46 46)
    private static final Map<String, byte[]> MAGIC_BYTES = Map.of(
            "image/jpeg", new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF},
            "image/png",  new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47},
            "image/gif",  new byte[]{0x47, 0x49, 0x46},
            "image/webp", new byte[]{0x52, 0x49, 0x46, 0x46}
    );

    @Override
    public boolean isValid(MultipartFile file, ConstraintValidatorContext context) {
        if (file == null || file.isEmpty())
            return true;

        if (file.getSize() > MAX_SIZE_BYTES)
            return buildViolation(context, "Image must not exceed 20MB");

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType))
            return buildViolation(context, "Unsupported image type");

        try {
            byte[] header = file.getInputStream().readNBytes(4);
            byte[] magic  = MAGIC_BYTES.get(contentType);
            if (magic != null) {
                for (int i = 0; i < magic.length; i++) {
                    if (i >= header.length || header[i] != magic[i])
                        return buildViolation(context, "File content does not match declared type");
                }
            }
        } catch (IOException e) {
            return buildViolation(context, "Could not read file");
        }

        return true;
    }

    private boolean buildViolation(ConstraintValidatorContext ctx, String msg) {
        ctx.disableDefaultConstraintViolation();
        ctx.buildConstraintViolationWithTemplate(msg).addConstraintViolation();
        return false;
    }
}