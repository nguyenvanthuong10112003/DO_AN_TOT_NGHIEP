package com.media.e_learning.repository;

import com.media.e_learning.entity.RabbitMQLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RabbitMQLogRepository extends JpaRepository<RabbitMQLog, Long> {
}
