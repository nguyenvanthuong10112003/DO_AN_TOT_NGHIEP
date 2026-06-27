package com.media.validator.video;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

public class VideoValidator implements ConstraintValidator<VideoConstraint, MultipartFile> {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "video/mp4",
            "video/quicktime",
            "video/x-matroska",
            "video/webm"
    );

    private static final long MAX_SIZE_BYTES = 500L * 1024 * 1024; // 500MB

    @Override
    public boolean isValid(
            MultipartFile file,
            ConstraintValidatorContext context
    ) {

        if (file == null || file.isEmpty()) {
            return true;
        }

        // Kiểm tra size
        if (file.getSize() > MAX_SIZE_BYTES) {
            return buildViolation(
                    context,
                    "Video must not exceed 500MB"
            );
        }

        // Kiểm tra type
        String contentType = file.getContentType();

        if (contentType == null ||
                !ALLOWED_TYPES.contains(contentType)) {

            return buildViolation(
                    context,
                    "Unsupported video type"
            );
        }

        return true;
    }

    private boolean buildViolation(
            ConstraintValidatorContext ctx,
            String msg
    ) {

        ctx.disableDefaultConstraintViolation();
        ctx.buildConstraintViolationWithTemplate(msg)
                .addConstraintViolation();

        return false;
    }
}