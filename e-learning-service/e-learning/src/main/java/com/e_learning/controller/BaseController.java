package com.e_learning.controller;

import com.e_learning.exception.AppException;
import com.e_learning.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class BaseController {
    protected RuntimeException generateError(Exception e) {
        if (e == null) return new AppException(ErrorCode.UNKNOW_ERROR);
        if (e instanceof AppException) return (AppException) e;
        log.error("Error: {}", e.getMessage());
        e.printStackTrace();
        return new RuntimeException(e.getMessage());
    }
}
