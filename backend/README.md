# SplitFlow - Backend

Servidor backend para **SplitFlow**, desarrollado con **Java 21**, **Spring Boot** y **PostgreSQL**. Se encarga de gestionar la lógica de usuarios, grupos de gastos y el registro de transacciones.

## 🚀 Stack Tecnológico

- **Java 21** (Eclipse Adoptium)
- **Spring Boot** (Web, Data JPA)
- **Gradle** (Sistema de construcción)
- **PostgreSQL** (Base de datos relacional)
- **Lombok** (Reducción de código repetitivo)

## ⚙️ Configuración y Requisitos Previos

1. **Java 21 instalado** y la variable de entorno `JAVA_HOME` configurada correctamente.
2. **PostgreSQL** corriendo de manera local.
3. Crear la base de datos en PostgreSQL:
   ```sql
   CREATE DATABASE splitflow_db;
   ```

## Endpoints principales

- `GET/POST /api/groups`
- `GET /api/groups/invite/{inviteCode}`
- `GET/POST /api/groups/{id}/members`
- `GET/POST /api/groups/{id}/expenses`
- `GET /api/groups/{id}/balances`
- `GET /api/groups/{id}/balances/{userId}/breakdown`
- `POST /api/groups/{id}/payments`

## Ejecucion y validacion

```bash
./gradlew bootRun
./gradlew compileJava
```