package com.media.e_learning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(schema = "e-learning-log", catalog = "e-learning-log")
public class RabbitMQLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String body;
    private String consumer;
    private Long retryNum;
    @Column(updatable = false)
    private LocalDateTime createdTime;
    @Column(columnDefinition = "TEXT")
    private String errorMessage;
}