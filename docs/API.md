# Catálogo de Endpoints — SplitFlow API

Contrato de comunicación oficial entre el backend en Spring Boot y el cliente frontend.

## 1. Autenticación (`/api/auth`)
- `POST /register` — Registra un nuevo usuario en la plataforma.
- `POST /login` — Autentica al usuario y retorna un token JWT válido.

## 2. Gestión de Grupos (`/api/groups`)
- `POST /` — Crea un nuevo grupo de gastos.
- `GET /{id}` — Obtiene el detalle de un grupo y su lista de miembros.
- `POST /{id}/members` — Agrega un usuario al grupo.

## 3. Gastos y Repartos (`/api/groups/{id}/expenses`)
- `POST /` — Registra un gasto especificando pagador, monto total y distribución (`ExpenseSplit`).
- `GET /` — Lista los gastos asociados al grupo con su respectivo desglose.

## 4. Saldos y Pagos (`/api/groups/{id}`)
- `GET /balances` — Devuelve el balance neto de cada miembro y el cálculo simplificado de deudas cruzadas.
- `POST /payments` — Registra un pago directo para saldar una deuda pendiente entre usuarios.