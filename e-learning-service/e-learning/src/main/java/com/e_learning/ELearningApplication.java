package com.e_learning;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@SpringBootApplication
public class ELearningApplication {

	public static void main(String[] args) {
		SpringApplication.run(ELearningApplication.class, args);
	}

}