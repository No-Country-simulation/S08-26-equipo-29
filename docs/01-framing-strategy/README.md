# 01 · Framing & Strategy

Fase de definición: del problema investigado a requisitos que se pueden construir y verificar.

## Documentos

| Archivo | Qué contiene |
|---|---|
| [PRD — SplitFlow v1](./prd-splitflow-v1.md) | Documento maestro de requisitos: alcance, priorización, requisitos funcionales, criterios de aceptación, modelo de datos y contratos de API |
| [JTBD Cards — criterios de éxito](./jtbd-cards-criterios-de-exito.md) | Los 10 criterios del brief desglosados en tarjetas, con escenarios de aceptación y su cadena de dependencias |

## Los 10 criterios de éxito

El brief define el éxito así: **un usuario que nunca usó la plataforma completa estas 10 tareas sin instrucciones externas.** Es el filtro de toda decisión de producto y de diseño.

| # | Tarea |
|---|---|
| C1 | Crear un grupo |
| C2 | Invitar participantes |
| C3 | Registrar un gasto |
| C4 | Seleccionar quiénes participan |
| C5 | Definir cómo dividirlo |
| C6 | Consultar cuánto corresponde a cada persona |
| C7 | Visualizar sus deudas |
| C8 | Comprender de dónde surge cada importe |
| C9 | Registrar un pago |
| C10 | Identificar cuándo todas las cuentas están saldadas |

## Cómo leer el PRD si no vienes de producto

El PRD usa varios formatos estándar. Todos están explicados dentro del documento, pero en corto:

| Formato | Qué es | Dónde |
|---|---|---|
| **MoSCoW / RICE** | Priorización: qué entra al MVP y en qué orden | §10 |
| **EARS** | Plantilla de requisitos sin ambigüedad: *"Cuando \<condición\>, el sistema deberá \<respuesta\>"* | §11 |
| **Gherkin** | Criterios de aceptación como **Dado** → **Cuando** → **Entonces**. Los lee diseño, dev y QA sin traducción | §12 |
| **Glosario técnico** | REST, JSON, JWT, ORM, UUID y demás, explicados para el equipo de diseño | §15b |
| **Consideraciones mobile** | Convenciones iOS vs. Android y checklist de entrega por pantalla | §15c |

## Dos cosas abiertas que afectan a desarrollo

- **`[NI-1]` Plataforma** — web responsive/PWA vs. React Native. Sigue sin cerrarse y condiciona las convenciones nativas de toda la UI.
- **`NG-2` vs. el diseño de deudas** — el PRD declara *non-goal* optimizar deudas cruzadas (neteo A→B→C), pero la vista de deudas diseñada asume ese neteo. Hay que cerrarlo antes de implementar C7.

> Fase anterior: [00 · Discovery & Research](../00-discovery-research/)
