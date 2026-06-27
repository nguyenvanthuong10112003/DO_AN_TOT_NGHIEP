package com.media.validator.image;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Constraint(validatedBy = ImageValidator.class)
@Target({ ElementType.FIELD, ElementType.PARAMETER, ElementType.TYPE_USE })
@Retention(RetentionPolicy.RUNTIME)
public @interface ImageConstraint {
    String message() default "File must be a valid image";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
