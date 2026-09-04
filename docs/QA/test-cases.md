# 🧪 Casos de Prueba - SplitFlow

## Módulo: Gestión de Gastos y Balances

### CP-001: Registro exitoso de gasto con división equitativa
* **Descripción:** Validar que un gasto se divida en partes iguales entre todos los miembros seleccionados.
* **Precondiciones:** Existe un grupo creado ("Viaje de Amigos") con 4 integrantes (Ana, Ben, Cris, Dani).
* **Pasos:**
  1. Hacer clic en "Agregar Gasto".
  2. Ingresar Monto: `$4000`, Concepto: `Supermercado`.
  3. Seleccionar como Pagador a: `Ana`.
  4. Seleccionar Participantes: `Todos` (Ana, Ben, Cris, Dani).
  5. Presionar "Guardar".
* **Resultado Esperado:** El sistema calcula que a cada participante le corresponden `$1000`. El balance muestra que Ben, Cris y Dani le deben `$1000` cada uno a Ana.

### CP-002: Registro de gasto con exclusión de un participante
* **Descripción:** Validar que un integrante que no participó de un consumo no sea incluido en la deuda de ese gasto específico.
* **Precondiciones:** Grupo con 3 integrantes (Ana, Ben, Cris).
* **Pasos:**
  1. Hacer clic en "Agregar Gasto".
  2. Ingresar Monto: `$3000`, Concepto: `Cena (Cris no asistió)`.
  3. Seleccionar como Pagador a: `Ana`.
  4. Seleccionar Participantes: `Ana` y `Ben` (Desmarcar a Cris).
  5. Presionar "Guardar".
* **Resultado Esperado:** El sistema calcula una división de `$1500` por persona. El balance muestra que Ben le debe `$1500` a Ana. La deuda de Cris con Ana por este concepto se mantiene en `$0`.

