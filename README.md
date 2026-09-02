SplitFlow — S08-26-equipo-29
Plataforma digital para la gestión y división de gastos compartidos en grupos, orientada a simplificar el cálculo de deudas y las liquidaciones entre usuarios.

Descripción
SplitFlow permite a grupos registrar gastos compartidos de forma sencilla y calcula automáticamente la menor cantidad de transferencias necesarias para que todos salden sus cuentas. El resultado final de esta etapa es un MVP funcional con un backend robusto en Spring Boot y una interfaz integrada en React.

=============================================================
                  EQUIPO DE TRABAJO - SPLITFLOW
=============================================================
[Rider Manrique]    --> Backend Developer 
[Julián Rozo]       --> Product Designer 
[Vanesa Gamarra]    --> UX Researcher 
[Nathaly Maestre]   --> UX/UI Designer 
[Felipe]            --> UX/UI Designer 
[Abel]              --> QA Engineer 
=============================================================

Estructura del Repositorio
El proyecto opera bajo una arquitectura de monorepo para centralizar los componentes principales:

backend/ — API REST desarrollada en Java con Spring Boot, Spring Data JPA y Spring Security (JWT).

frontend/ — Interfaz de usuario construida en React con Vite y Bootstrap.

database/ — Esquemas relacionales y scripts de configuración en PostgreSQL.

docs/ — Documentación técnica del sistema y catálogo de endpoints (API.md y ARCHITECTURE.md).

Variables de Entorno
Por seguridad, ningún archivo .env que contenga credenciales reales se incluye en el control de versiones.

Cada entorno dispone de un archivo .env.example con la estructura de variables requeridas.

Copiar el archivo como .env en el directorio correspondiente y completar los datos de conexión:

URL y credenciales de la base de datos PostgreSQL.

Clave secreta para la generación y validación de tokens JWT.

Guía de Ejecución Local
Requisitos previos: JDK 21+, Node 20+, PostgreSQL y Maven.


# 1. Clonar el repositorio y posicionarse en la rama de desarrollo
git clone https://github.com/No-Country-simulation/S08-26-equipo-29.git
cd S08-26-equipo-29/
git checkout dev

# 2. Configurar y levantar el Backend
cd backend
cp .env.example .env
# Completar las credenciales en el archivo .env creado
./mvnw spring-boot:run

# 3. Configurar y levantar el Frontend (en una terminal paralela)
cd ../frontend
npm install
cp .env.example .env
npm run dev