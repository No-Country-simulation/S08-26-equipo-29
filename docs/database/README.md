# Base de Datos - SplitFlow

Documentación del modelo relacional y scripts de configuración para la base de datos de **SplitFlow**.

## ⚙️ Configuración del Motor
- **SGBD:** PostgreSQL (Versión 15 recomendada)
- **Nombre de la Base de Datos:** `splitflow_db`

## 📊 Modelo Entidad-Relación (Estructura)

La base de datos está compuesta por las siguientes entidades principales gestionadas automáticamente por Hibernate vía JPA:

1. **User (Usuarios):** Almacena la información de los participantes de los grupos de gastos.
2. **Group (Grupos):** Representa los grupos o eventos de gastos compartidos (ej. "Viaje a la costa", "Alquiler").
3. **Expense (Gastos):** Registra los gastos individuales realizados dentro de un grupo, indicando quién pagó y a qué grupo pertenece.

## 🚀 Inicialización Rápida

Si necesitás crear la base de datos manualmente desde la terminal con `psql`:

```cmd
psql -U postgres -c "CREATE DATABASE splitflow_db;"