package com.splitflow.backend;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SplitFlow API Backend")
                        .version("1.0.0")
                        .description("Documentación oficial de la API para la gestión de gastos compartidos y grupos."));
    }
}