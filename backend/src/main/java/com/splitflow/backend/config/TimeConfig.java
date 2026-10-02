package com.splitflow.backend.config;

import java.time.Clock;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TimeConfig {
    // Reloj único de la aplicación en UTC: la fecha "de hoy" no depende de la zona horaria del servidor
    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }
}
