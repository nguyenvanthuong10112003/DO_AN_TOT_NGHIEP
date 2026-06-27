package com.e_learning.controller;

import com.e_learning.common.Const;
import com.e_learning.dto.request.SendEmailDTO;
import com.e_learning.dto.response.ResponseApi;
import com.e_learning.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/tests")
public class TestController {
    @Autowired
    private NotificationService notificationService;
    @PostMapping("/send-email")
    public ResponseApi<?> sendEmail() {
        notificationService.sendEmailAsync(SendEmailDTO.builder()
            .title("WELCOME")
            .receiver("nguyenvanthuong10112003@gmail.com")
            .template(Const.TEMPLATE_SEND_EMAIL_CONTENT)
            .build());
        return ResponseApi.createSuccess();
    }
}
