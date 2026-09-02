# Arquitectura del Sistema — SplitFlow

## 1. Visión General
SplitFlow está diseñado bajo una arquitectura de **Monorepo**, separando claramente los componentes de backend, frontend, base de datos y documentación en un mismo repositorio. Esto facilita la visibilidad de todo el sistema para el equipo y agiliza las revisiones.

## 2. Componentes del Monorepo

- **`backend/`**: API REST desarrollada en Java con **Spring Boot**. Se encarga de la lógica de negocio, autenticación mediante JWT, persistencia con Spring Data JPA y el cálculo algorítmico de liquidación de deudas.
- **`frontend/`**: Interfaz de usuario construida en **React** con **Vite** y **Bootstrap**, enfocada en la experiencia de usuario para la gestión de grupos y gastos.
- **`database/`**: Scripts de configuración, migraciones y esquemas relacionales para **PostgreSQL**.
- **`docs/`**: Contiene el catálogo de endpoints (`API.md`) y la documentación técnica general del proyecto.

## 3. Decisiones Clave (ADRs implícitos)
- **Separación de responsabilidades:** El backend expone una API REST pura y el frontend consume los recursos mediante JSON.
- **Seguridad:** Manejo estricto de secretos mediante variables de entorno (`.env`) excluidas del control de versiones, utilizando plantillas `.env.example`.
- **Estrategia de ramas:** Uso de flujo basado en `dev` para integración continua y `main` para las versiones estables de producción o demos.