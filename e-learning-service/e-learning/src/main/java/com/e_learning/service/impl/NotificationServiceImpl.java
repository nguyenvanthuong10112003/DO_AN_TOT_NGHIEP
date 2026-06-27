package com.e_learning.service.impl;

import com.e_learning.dto.request.SendEmailDTO;
import com.e_learning.service.NotificationService;
import jakarta.mail.MessagingException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import java.io.UnsupportedEncodingException;
import java.util.Collections;
import java.util.Objects;

@Slf4j
@Service
public class NotificationServiceImpl implements NotificationService {
    @Value("${spring.mail.from}")
    String mailFrom;
    @Value("${spring.mail.username}")
    String email;
    @Autowired
    private JavaMailSender mailSender;
    @Autowired
    private SpringTemplateEngine templateEngine;

    @Async
    @Override
    public void sendEmailAsync(SendEmailDTO sendEmailDTO) {
        try {
            MimeMessage message = createMail(sendEmailDTO);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Send email error: {}", e.getMessage());
            e.printStackTrace();
        }
    }


    private MimeMessage createMail(SendEmailDTO dto) throws MessagingException, UnsupportedEncodingException {
        Context context = new Context();
        if (!Objects.requireNonNullElse(dto.getMapping(), Collections.emptyMap())
                .isEmpty())
            dto.getMapping().forEach(context::setVariable);

        if (dto.getBody() != null)
            context.setVariable("body", dto.getBody());

        String body = templateEngine.process(dto.getTemplate(), context);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(dto.getReceiver());
        helper.setSubject(dto.getTitle());
        helper.setText(body, true);
        helper.setFrom(email, mailFrom);

        return message;
    }
}
