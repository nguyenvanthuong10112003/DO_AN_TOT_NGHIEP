package com.e_learning.service;

import com.e_learning.dto.request.SendEmailDTO;

public interface NotificationService {
    void sendEmailAsync(SendEmailDTO sendEmailDTO);
}
