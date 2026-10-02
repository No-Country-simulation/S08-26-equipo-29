# SplitFlow — Análisis de incidencia

__Escenario reportado como posible CP-012 — pestaña Deudas__

  

## ¿Corresponde a CP-012?

No. CP-012 valida la sugerencia de liquidación optimizada (el mensaje de reducir la cantidad de pagos necesarios entre tres o más personas). Las capturas analizadas muestran la pestaña "Deudas" con la lista directa de quién le debe a quién, sin ningún mensaje de sugerencia ni optimización — es el comportamiento esperado si esa función no está implementada, coherente con el non-goal del PRD, y no un fallo de CP-012.

## Cálculo del escenario

****Datos del escenario:**** Cena $4.000 (pagada por la usuaria, participan los 4 integrantes) y Bebidas $3.000 (pagada por la usuaria, sin participar ella). Según la anotación del escenario, le deben $6.000 en total, $2.000 cada uno de los otros tres integrantes.

| Persona | Esperado | Obtenido en la app | ¿Coincide? |
| ------- | -------- | ------------------ | ---------- |
| María   | $2.000   | $2.000             | Sí         |
| Juan    | $2.000   | $1.500             | No         |
| Pedro   | $2.000   | $1.000             | No         |
| Total   | $6.000   | $4.500             | No         |

## Bug identificado — BUG-004

### Descripción

Cálculo incorrecto del saldo acumulado al combinar varios gastos del mismo grupo con distintos participantes excluidos en cada uno. El sistema no está sumando correctamente la parte correspondiente a cada persona a través de los dos gastos.

### Severidad y prioridad

****Severidad:**** Alta — afecta directamente el cálculo central del producto. ****Prioridad:**** Alta.

### Resultado esperado

Cada uno de los tres integrantes debe $2.000 (resultado de sumar $1.000 de la cena + $1.000 de las bebidas), para un total de $6.000.

### Resultado obtenido

María aparece correctamente con $2.000. Juan aparece con $1.500 en vez de $2.000. Pedro aparece con $1.000 en vez de $2.000. El total mostrado es $4.500 en vez de $6.000.

### Caso de prueba relacionado

Más cercano a CP-006 / CP-007 (registro de gasto con exclusión de participantes y montos exactos) que a CP-012. Se recomienda crear un caso nuevo (CP-020) que cubra específicamente el escenario de múltiples gastos combinados con distintos participantes excluidos, para que quede como caso repetible de regresión.

## Cambios propuestos en la documentación de QA

-   CP-012: revertir su estado de "Fallido" a "No ejecutado — funcionalidad no implementada", ya que las capturas no muestran evidencia de ningún intento de sugerencia de liquidación.
-   Agregar BUG-004 al reporte de ejecución, con los montos documentados en este análisis.
-   Agregar CP-020 a test-cases.md para cubrir el escenario de gastos combinados con participantes excluidos de forma distinta.
