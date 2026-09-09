---
kind: benchmark-visual
project: splitflow
phase: discovery
type: diagrama-transcrito
source: benchmark-visual-tricount.excalidraw
---

# Benchmark Visual — Tricount

> Análisis del competidor más cercano: 6 dimensiones evaluadas, 3 oportunidades priorizadas y el diferenciador que abre para SplitFlow.
>
> **Transcripción en texto de un diagrama.** Reconstruida desde [`benchmark-visual-tricount.excalidraw`](./benchmark-visual-tricount.excalidraw); la versión visual está en [`benchmark-visual-tricount.png`](./benchmark-visual-tricount.png). El análisis en prosa está en [benchmark-tricount.md](../benchmark-tricount.md).
>
> Benchmark · SplitFlow · 2026-09-01

---

## Contexto de producto

> «La forma más fácil de dividir gastos entre amigos»

Fundada en Bélgica · 2010 → Adquirida por **bunq** · 2022

**Simple · Confiable · Masiva**

| Métrica | Valor |
|---|---|
| Usuarios activos | **21 M** |
| App Store | **4.8 ★** |
| Gastos repartidos en 2025 | **£20.2 B** |

| | |
|---|---|
| **Modelo de negocio** | Freemium sin límite de grupos · Plan Premium sin publicidad |
| **Plataformas** | iOS · Android · Web básico (solo consulta) |
| **Señal estratégica** | Bunq adquirió Tricount en 2022 · Los datos de gasto = activo bancario |

**Flujo central prometido:** Invitas amigos → Añades gastos → Te enfocas en disfrutar

---

## Análisis por dimensión

*6 dimensiones de Tricount · A–F = orden del flujo del usuario, no dos productos.*

**Leyenda:** `✓ BIEN` = bien resuelto en Tricount · `⚠ MIXTO` = funciona pero con limitaciones · `✗ GAP CRÍTICO` = sin resolver · mejora para SplitFlow

### A · Onboarding — `⚠ MIXTO`
**11 pasos al primer valor.** Claro pero con fricción inicial · empty state bien diseñado.

### B · Registro de gasto — `⚠ MIXTO`
**3 métodos de división · sin validación inline.** Igualmente / Partes / Por importes.

### C · Saldos & deudas — `✗ GAP CRÍTICO`
**Simplificados pero sin trazabilidad al origen.** Saldo neto ≠ desglose. El usuario reconstruye manualmente.

### D · Cierre de deuda — `✓ BIEN`
**"Mark as paid" sin pago real — reduce fricción.** No requiere integración bancaria para cerrar una deuda.

### E · Arquitectura — `✓ BIEN`
**Tabs claros · Home = lista de grupos.** Expenses / Balances / Photos. Navegación predecible.

### F · Escala — `⚠ MIXTO`
**Búsqueda sí · Filtros no · Máx 50 personas.** UI idéntica para 3 o 40 personas. Sin filtros de fecha.

---

## ¿Qué deja abierto Tricount?

*Tres oportunidades priorizadas · SplitFlow puede resolver lo que Tricount no resuelve.*

### #1 · Trazabilidad de saldos — `CRÍTICO`

**Tricount hoy:** Juan le debe $25.000 a María — pero no puede ver de dónde viene ese número. Saldo neto ≠ detalle: el origen de cada deuda queda invisible.

**→ SplitFlow:** toca el saldo → ves los gastos que lo componen.

### #2 · Filtros en grupos grandes — `IMPORTANTE`

**Tricount hoy:** con 10 personas y 35 gastos, solo hay búsqueda por texto. Sin filtros por fecha, participante o categoría — la escala penaliza al usuario.

**→ SplitFlow:** filtros por fecha, persona y categoría desde v1.

### #3 · Feedback inline al dividir — `QUICK WIN`

**Tricount hoy:** al repartir por importes, no hay indicador en tiempo real de cuánto queda sin asignar. El error aparece solo cuando el usuario intenta guardar.

**→ SplitFlow:** contador en tiempo real — "$5.000 sin asignar" mientras el usuario escribe.

---

## El acierto y su costo

| | |
|---|---|
| **Mayor acierto** — por qué destaca en Tricount | Algoritmo de simplificación de deudas: 10 transferencias → 2–3 óptimas |
| **Mayor sacrificio** — el costo de esa simplificación | Trazabilidad: el saldo final no muestra de dónde viene |

> **Tricount optimiza el número de transferencias — pero sacrifica la transparencia de cada saldo. SplitFlow puede hacer las dos cosas: menos transferencias Y trazabilidad completa.**
>
> Este es el diferenciador central del pitch ante los evaluadores de No Country.

| | Tricount | SplitFlow |
|---|---|---|
| Agrupación de deudas | ✓ Agrupa deudas: 10 transferencias → 2-3 | ✓ Mismo algoritmo: 10 transferencias → 2-3 |
| Origen del saldo | ✗ Saldo = cifra sin detalle de origen | ✓ Saldo expandible: toca el número → ves cada gasto |

---

> **Nota de trazabilidad documental (no forma parte del diagrama).** La última fila asume que SplitFlow implementa el mismo algoritmo de simplificación de deudas que Tricount. El PRD lo declara *non-goal* (`NG-2`), justamente por el sacrificio de trazabilidad que este análisis identifica. Como SplitFlow sí resuelve la trazabilidad por otra vía (saldo expandible), la tensión sigue abierta y hay que cerrarla con el equipo antes de implementar la vista de deudas.
