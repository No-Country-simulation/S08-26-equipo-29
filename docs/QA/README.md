# 02 · QA & Pruebas

Fase de verificación: del prototipo construido a evidencia de que cumple (o no) los criterios de éxito del brief.

## Documentos

| Archivo                               | Qué contiene                                                                                                    |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Plan de Pruebas (test-plan.md)        | Alcance, entornos validados (Mobile/Desktop), tipos de prueba y criterios de aceptación                         |
| Casos de Prueba (test-cases.md)       | Los 15 escenarios paso a paso: creación de grupo, invitación, registro de gasto, saldos, pagos                  |
| Reporte de Ejecución (test-report.md) | Resultado de cada caso, bugs encontrados y cobertura contra los 10 criterios de éxito del brief                 |
| Análisis de incidencia — BUG-004      | Investigación puntual de un escenario reportado como posible CP-012, que resultó ser un bug de cálculo distinto |

## Estado actual de la ejecución

|                    |                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| Casos planificados | 15                                                                                             |
| Aprobados          | 12                                                                                             |
| Fallidos           | 1 — BUG-004 (cálculo de saldo con gastos combinados)                                           |
| No ejecutados      | 2 — CP-014, CP-015 (confirmación mutua de pago; la funcionalidad no existe en el build actual) |

****Cobertura:**** los 10 criterios de éxito del brief están cubiertos por al menos un caso aprobado.

## Bugs abiertos

| ID      | Descripción                                                                                                          | Severidad | Estado  |
| ------- | -------------------------------------------------------------------------------------------------------------------- | --------- | ------- |
| BUG-004 | El saldo no suma correctamente la parte de cada persona al combinar dos gastos con distintos participantes excluidos | Alta      | Abierto |

## Bugs resueltos / no aplicables

| ID      | Descripción                                                        | Estado                                                                                        |
| ------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| BUG-001 | Redondeo decimal en divisiones no exactas                          | ✅ Resuelto, verificado en esta ejecución                                                      |
| BUG-002 | Deuda sin resolución visible si la contraparte no confirma el pago | No aplica — CP-014/CP-015 no ejecutados, el flujo de confirmación mutua no existe en el build |

## Cómo leer esto si no venís de QA

-   Un caso de prueba (****CP-XXX****) describe un escenario puntual: precondiciones, pasos, resultado esperado.
-   Un ****bug**** documenta la diferencia entre lo esperado y lo que realmente pasó, con severidad (impacto) y prioridad (urgencia de arreglo).
-   "No ejecutado" es distinto de "fallido": significa que el caso no se pudo correr, normalmente porque la pantalla o función que necesita no existe en el build actual — no que algo se haya roto.

## Dos cosas abiertas que afectan a esta fase

-   **`**CP-012**`** quedó marcado como __no ejecutado — funcionalidad no implementada__ (sugerencia de liquidación optimizada), coherente con el non-goal `NG-2` del PRD — pero ese non-goal sigue sin cerrarse formalmente con el equipo (ver Conflicto A en el resumen estratégico de la fase anterior).
-   **`**CP-020**`**, propuesto para cubrir el escenario del BUG-004 (gastos combinados con distintos participantes excluidos), todavía no está escrito en `test-cases.md`.

> Fase anterior: 01 · Framing & Strategy

## 🗂️ Documentación del Ciclo de Pruebas (Entregables)
He estructurado el proceso de QA en tres fases clave dentro de este repositorio. Puedes navegar por cada documento haciendo clic en los siguientes enlaces:

* [📋 **Plan de Pruebas (test-plan.md)**](./test-plan.md): Define el alcance de la prueba, los entornos validados (Mobile/Desktop) y la estrategia general de calidad.
* [🧪 **Casos de Prueba (test-cases.md)**](./test-cases.md): Detalla los escenarios diseñados paso a paso, incluyendo flujos ideales de división equitativa y flujos alternativos (exclusión de participantes).
* [📊 **Reporte de Ejecución y Bugs (test-report.md)**](./test-report.md): Muestra las métricas finales de la ejecución, el estado de los casos y el reporte detallado del bug de redondeo decimal hallado en los balances.
* [📊 **Análisis de Incidencia Bugs (analisis-incidencia.md)**](./analisis-incidencia.md): El detalle del BUG-004, y los tres cambios propuestos para la documentación de QA.
---


* **Entornos Probados:** Emuladores de dispositivos móviles (Chrome DevTools) y navegadores de escritorio comerciales.

