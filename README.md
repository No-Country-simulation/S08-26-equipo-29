# SplitFlow - S08-26-equipo-29

Plataforma digital para la gestión y división de gastos compartidos en grupos (viajes, salidas, hogares), orientada a simplificar el cálculo de deudas y las liquidaciones entre usuarios.

## Descripción del Proyecto
SplitFlow permite a grupos registrar gastos compartidos de forma sencilla y calcula automáticamente la menor cantidad de transferencias necesarias para que todos salden sus cuentas.

**Entregable:** MVP funcional con backend robusto en Spring Boot y frontend integrado.

## Equipo de Trabajo

| Nombre | Rol | LinkedIn |
|---|---|---|
| **Rider Manrique** | Backend Developer | [link](https://www.linkedin.com/in/rider-manrique/) |
| **Julián Rozo** | Product Designer | - |
| **Vanesa Gamarra** | UX Researcher | - |
| **Nathaly Maestre** | UX/UI Designer | - |
| **Felipe** | UX/UI Designer | - |
| **Abel** | QA Engineer | - |

---

## Estructura del Repositorio (Monorepo)

| Directorio | Entregable / Componente |
|---|---|
| [`backend/`](backend/) | API REST en Java con Spring Boot, Spring Data JPA y Spring Security (JWT) |
| [`frontend/`](frontend/) | Interfaz de usuario desarrollada en React con Vite y Bootstrap |
| [`database/`](database/) | Esquemas relacionales y scripts de configuración en PostgreSQL / MySQL |
| [`docs/`](docs/) | Documentación de arquitectura y catálogo de endpoints (`API.md`) |

---

## Estacionamiento de Secretos y Variables de Entorno

> **Regla de oro:** Ningún archivo `.env` con credenciales reales se sube al repositorio.

1. Cada entorno cuenta con un archivo **`.env.example`** con los nombres de las variables requeridas.
2. Copiar el archivo correspondiente a `.env` en tu entorno local y completar los valores de conexión:
   * URL de la base de datos PostgreSQL/MySQL.
   * Clave secreta para generación de tokens JWT.

---

## Guía de Ejecución Local

**Requisitos:** JDK 21+, Node 20+, PostgreSQL o MySQL, y Maven.

```bash
# 1. Clonar el repositorio y ubicarse en la rama de trabajo
git clone [https://github.com/No-Country-simulation/S08-26-equipo-29.git](https://github.com/No-Country-simulation/S08-26-equipo-29.git)
cd S08-26-equipo-29/
git checkout dev

# 2. Configurar el Backend
cd backend
cp .env.example .env
# Completar las credenciales de la base de datos en .env
./mvnw spring-boot:run

# 3. Configurar el Frontend (en otra terminal)
cd ../frontend
npm install
cp .env.example .env
npm run dev