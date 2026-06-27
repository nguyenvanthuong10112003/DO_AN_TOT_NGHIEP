package com.e_learning.helper;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

import java.util.Set;

public class ValidatorUtil {
    private static final Validator validator;

    static {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    public static <T> void validate(T object) {
        Set<ConstraintViolation<T>> violations = validator.validate(object);

        if (!violations.isEmpty()) {
            StringBuilder sb = new StringBuilder();

            for (ConstraintViolation<T> v : violations) {
                sb.append(v.getPropertyPath())
                        .append(" ")
                        .append(v.getMessage())
                        .append("\n");
            }

            throw new RuntimeException(sb.toString());
        }
    }
}
