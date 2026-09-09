# 00 · Discovery & Research

Fase de investigación de SplitFlow: entender el problema y el territorio competitivo antes de definir nada.

## Documentos

| Archivo | Qué contiene |
|---|---|
| [Brief del reto — No Country](./brief-del-reto-no-country.md) | El enunciado original del reto: problema, contexto, workarounds actuales y los **10 criterios de éxito** que son el filtro de todo el proyecto |
| [Benchmark — Tricount](./benchmark-tricount.md) | Análisis en profundidad del competidor más cercano: qué resuelve, qué sacrifica y qué gap deja |
| [Síntesis cross-benchmark](./sintesis-cross-benchmark.md) | Comparación de 4 apps (Tricount, Splitwise, Splid, Splital) y las conclusiones que orientaron el diseño |

## Diagramas

Cada diagrama viene en tres formatos, en [`diagramas/`](./diagramas/):

- **`.md`** — transcripción en texto: legible en cualquier editor y procesable por herramientas o agentes de IA, sin tener que abrir el diagrama.
- **`.png`** — la versión visual, se ve directo en GitHub.
- **`.excalidraw`** — la fuente editable, se abre en [excalidraw.com](https://excalidraw.com).

| Diagrama | Para qué | Leer | Ver | Editar |
|---|---|---|---|---|
| Brief visual | El reto en una página: problema, flujo propuesto, criterios de éxito y glosario | [md](./diagramas/brief-visual-splitflow.md) | [png](./diagramas/brief-visual-splitflow.png) | [excalidraw](./diagramas/brief-visual-splitflow.excalidraw) |
| Proto-persona — Camila Rodríguez | El usuario objetivo del MVP | [md](./diagramas/proto-persona-splitflow.md) | [png](./diagramas/proto-persona-splitflow.png) | [excalidraw](./diagramas/proto-persona-splitflow.excalidraw) |
| Benchmark visual — Tricount | 6 dimensiones evaluadas y 3 oportunidades priorizadas | [md](./diagramas/benchmark-visual-tricount.md) | [png](./diagramas/benchmark-visual-tricount.png) | [excalidraw](./diagramas/benchmark-visual-tricount.excalidraw) |
| Benchmarking — preguntas clave | El marco de 6 dimensiones con el que se analizó cada app | [md](./diagramas/benchmarking-preguntas-clave.md) | [png](./diagramas/benchmarking-preguntas-clave.png) | [excalidraw](./diagramas/benchmarking-preguntas-clave.excalidraw) |

Capturas de referencia de las apps analizadas, en [`assets/`](./assets/): `benchmark-splitwise.png`, `benchmark-splid.png`, `benchmark-splital.png`.

## Las 3 conclusiones que más pesaron en el diseño

1. **El formulario de gasto mínimo viable** — qué campos son realmente universales entre las 4 apps.
2. **Ninguna app muestra en tiempo real cuánto falta por asignar** al dividir por monto específico. Es el quick-win de menor costo del producto.
3. **Las 4 apps separan la lista de gastos de los saldos**, obligando al usuario a reconstruir a mano de dónde sale un número. Ese es el gap que SplitFlow ataca con el desglose trazable.

> Siguiente fase: [01 · Framing & Strategy](../01-framing-strategy/)
