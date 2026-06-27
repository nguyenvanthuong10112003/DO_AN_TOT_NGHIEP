package com.media.repository;

import com.media.entity.RabbitMQLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RabbitMQLogRepository extends JpaRepository<RabbitMQLog, Long> {
}
