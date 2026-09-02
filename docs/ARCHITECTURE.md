Arquitectura del Sistema — SplitFlow
SplitFlow se estructura bajo un modelo de monorepo que centraliza el código fuente, la base de datos y la documentación en un único espacio de trabajo.

1. Visión General
La organización unificada permite mantener una visibilidad total del sistema, facilitando el control de versiones y el seguimiento de los entregables tanto para el desarrollo del backend como para la interfaz de usuario.

2. Componentes del Monorepo
backend/ — API REST desarrollada en Java con Spring Boot, responsable de la lógica de negocio, la autenticación mediante JWT, la persistencia con Spring Data JPA y el cálculo algorítmico para liquidar deudas entre usuarios.

frontend/ — Interfaz de usuario construida en React con Vite y Bootstrap, diseñada para ofrecer una experiencia fluida en la creación de grupos y el registro de gastos.

database/ — Espacio destinado a los scripts de configuración, migraciones y esquemas relacionales para PostgreSQL.

docs/ — Repositorio de la documentación técnica del proyecto, incluyendo el catálogo de endpoints en el archivo API.md.

3. Decisiones Clave
Separación de responsabilidades — El backend opera exclusivamente como una API REST pura, mientras que el frontend procesa y consume los recursos a través de formatos JSON.

Gestión de seguridad — Las credenciales y claves sensibles se configuran mediante variables de entorno locales en archivos .env, excluidos del control de versiones mediante plantillas .env.example.

Estrategia de ramas — El flujo de trabajo diario se concentra en la rama dev para asegurar la integración continua, destinando la rama main exclusivamente a las versiones estables y entregas del proyecto.