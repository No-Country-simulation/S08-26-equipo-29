package com.splitflow.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public Map<String, String> root() {
        return Map.of(
                "application", "SplitFlow API",
                "status", "UP",
                "frontend", "http://localhost:5173",
                "api", "/api/groups"
        );
    }
}
