---
kind: brief-visual
project: splitflow
phase: discovery
type: diagrama-transcrito
source: brief-visual-splitflow.excalidraw
---

# Brief Visual — SplitFlow

> El reto en una página: el problema de hoy, el flujo propuesto, los 10 criterios de éxito y el glosario base.
>
> **Transcripción en texto de un diagrama.** Reconstruida desde [`brief-visual-splitflow.excalidraw`](./brief-visual-splitflow.excalidraw); la versión visual está en [`brief-visual-splitflow.png`](./brief-visual-splitflow.png). El diagrama es una comparación en dos columnas — acá se lee como dos secciones.

**Gestión y división de gastos compartidos entre grupos.**

---

## EL PROBLEMA — lo que pasa hoy cuando un grupo comparte gastos

> **HOY:** «Tenemos que hacer cuentas para saber quién le debe a quién»

### Qué usan hoy

WhatsApp · Excel / Sheets · Notas del celular · Calculadora · Transferencias manuales

→ **CONFUSIÓN Y ERRORES**

### Puntos de dolor

1. **Registro fragmentado** — info dispersa en WhatsApp, notas, comprobantes y memoria
2. **División imprecisa** — partes iguales ≠ consumo real de cada persona
3. **Deudas confusas** — quién debe cuánto, a quién, y por qué concepto
4. **Grupos grandes** — 10 personas × 35 gastos = caos inmanejable
5. **Sin seguimiento** — deuda pendiente y deuda pagada lucen igual
6. **UX hostil** — herramientas financieras para un problema cotidiano
7. **Sin contexto** — "Juan debe $25.000" sin explicar de dónde sale

### El síntoma, en un caso concreto

```
Juan debe $25.000
   $12.000  — alojamiento
   $8.000   — supermercado
   $5.000   — transporte

¿De dónde sale ese número?
```

---

## LA SOLUCIÓN — un flujo unificado de principio a fin

> **CON SPLITFLOW:** «La plataforma nos muestra cuánto corresponde pagar, a quién y por qué»

### El flujo

1. Crear grupo
2. Invitar personas
3. Definir participantes
4. **Registrar gasto — momento crítico**
   *qué se compró · cuánto costó · quién pagó · quiénes participan · cómo dividir*
5. Calcular distribución (automático)
6. Visualizar saldos
7. Registrar pago
8. Cerrar deuda

**Estados de pago:** Pendiente → Pago iniciado → Pagado

### El mismo caso, resuelto

```
María debe $18.500 a Juan
   $10.000  — alojamiento   (÷ 4)
   $5.000   — supermercado  (÷ 3)
   $3.500   — transporte    (÷ 2)
```

Cada importe muestra su origen y su método de división. Es el diferenciador del producto.

---

## CRITERIO DE ÉXITO

Un usuario que nunca usó la plataforma puede completar estas tareas **sin instrucciones externas**:

| # | Tarea |
|---|---|
| 1 | Crear un grupo |
| 2 | Invitar participantes |
| 3 | Registrar un gasto |
| 4 | Seleccionar quiénes participan |
| 5 | Definir cómo dividirlo |
| 6 | Consultar cuánto corresponde a cada uno |
| 7 | Visualizar sus deudas |
| 8 | Comprender de dónde surge cada importe |
| 9 | Registrar un pago |
| 10 | Identificar cuándo todo está saldado |

---

## GLOSARIO

**UX (User Experience)** — Experiencia del usuario al interactuar con un producto digital. Cómo se siente usarlo, no solo cómo se ve.

**Saldo** — Diferencia entre lo que pagaste y lo que te corresponde del gasto total del grupo.

**Flujo (Flow)** — Secuencia de pasos que un usuario sigue para completar una tarea dentro de un producto digital.

**Carga cognitiva** — Esfuerzo mental para procesar información y tomar decisiones. Menos carga = experiencia más fluida.

**Progressive disclosure** — Patrón de diseño que muestra solo la info necesaria en cada momento, revelando detalles gradualmente.

**Pain point (punto de dolor)** — Frustración o problema específico que un usuario experimenta al intentar completar una tarea.
