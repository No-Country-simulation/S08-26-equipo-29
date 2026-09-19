---
kind: research
project: splitflow
date: 2026-08-31
tags:
  - project/splitflow
  - type/reference
  - phase/discovery
---

# Brief del Reto — SplitFlow · No Country

**Fuente:** No Country (simulación laboral) · **Fecha de inicio:** 2026-08-31

---

## Qué es No Country

No Country es una plataforma latinoamericana de simulación laboral tech. Los participantes forman equipos multidisciplinarios (diseñadores + desarrolladores) y construyen un producto real en formato sprint de 3-4 semanas, presentando ante evaluadores al cierre como si fuera un entorno de trabajo real. El objetivo: que profesionales junior y mid ganen experiencia equivalente a la de un trabajo real con proyecto, equipo y deadline.

**Entregables de la simulación** (plataforma No Country):

| # | Tarea | Descripción |
|---|---|---|
| 1 | Project Documentation | Información del proyecto y links en Markdown |
| 2 | Project Demo Video | Link de YouTube con demostración del producto |
| 3 | Team Tools | Herramientas y tecnologías usadas por el equipo |
| 4 | Project Links | Links al proyecto (Figma, repo, deploy) |

---

## El Problema

SplitFlow es una experiencia digital diseñada para simplificar la gestión y división de gastos entre grupos de personas: registrar consumos, asignar participantes, calcular automáticamente cuánto corresponde a cada integrante y hacer seguimiento de deudas.

El proyecto busca transformar un proceso habitualmente manual y confuso en una experiencia simple, clara y transparente.

---

## Contexto

Compartir gastos es cotidiano: amigos, parejas, familias, compañeros de vivienda, grupos de viaje. En una misma situación pueden existir múltiples gastos realizados por diferentes personas.

**Ejemplo típico (viaje):**
- Persona A paga el alojamiento
- Persona B paga el supermercado
- Persona C paga el transporte
- Persona D compra las entradas
- Persona E paga una cena

Al finalizar: ¿quién pagó, cuánto corresponde a cada uno, y quién le debe dinero a quién?

**Soluciones actuales (workarounds):**
- Mensajes de WhatsApp
- Notas del celular
- Planillas de Excel
- Calculadoras manuales
- Aplicaciones genéricas
- Transferencias manuales

---

## Pain Points del Usuario

### 1. Registro manual y desordenado
Los usuarios distribuyen la información en múltiples canales (WhatsApp + notas + comprobantes + transferencias + memoria), lo que provoca gastos olvidados o mal registrados.

### 2. Dificultad para dividir gastos de forma precisa
No todos los gastos se dividen equitativamente entre todos. Ejemplo:

> Una cena cuesta $60.000:
> - Persona A consumió $20.000
> - Persona B consumió $15.000
> - Persona C consumió $25.000
>
> Dividir el total en tres no refleja el consumo real de cada persona.

La experiencia debe resolver distintas situaciones de reparto sin añadir complejidad innecesaria.

### 3. Falta de claridad sobre las deudas
Los usuarios necesitan saber:
- Cuánto deben
- A quién deben pagar
- Cuánto tienen que recibir
- Qué gastos generaron la deuda
- Si una deuda ya fue saldada

Sin esta información clara, se generan errores y conflictos dentro del grupo.

### 4. Complejidad en grupos grandes
La dificultad escala con el tamaño del grupo:
> 10 personas + 35 gastos + participantes variables + métodos de pago mixtos

Una experiencia diseñada solo para grupos pequeños se vuelve inutilizable en escenarios complejos.

### 5. Falta de seguimiento de pagos
Registrar una deuda no equivale a haberla cobrado. El usuario necesita distinguir entre:
**Pendiente → Pago iniciado → Pagado**

### 6. Experiencia poco intuitiva
Una herramienta de gestión financiera puede resultar demasiado técnica para usuarios que simplemente quieren resolver una situación cotidiana. El desafío de diseño: hacer que una operación potencialmente compleja se perciba como **simple → clara → rápida → confiable**.

### 7. Falta de contexto sobre los importes
"Juan debe $25.000" no es suficiente. El usuario necesita ver de dónde surge:

```
Juan debe $25.000
  $12.000 — alojamiento
  $8.000  — supermercado
  $5.000  — transporte
```

Esto genera transparencia y confianza en los cálculos.

---

## La Oportunidad

Diseñar una experiencia que transforme un proceso fragmentado y propenso a errores en uno simple y transparente. **No es solo una calculadora de gastos** — es una experiencia completa de principio a fin:

**Crear grupo → Invitar personas → Registrar gasto → Definir participantes → Calcular distribución → Visualizar saldos → Solicitar/registrar pago → Cerrar deuda**

---

## Flujo Core (según el brief)

1. El grupo crea un espacio en SplitFlow e invita a sus integrantes
2. Durante la actividad, cada persona registra los gastos que realiza
3. Al cargar un gasto, especifica:
   - Qué se compró
   - Cuánto costó
   - Quién realizó el pago
   - Quiénes participaron
   - Cómo debe dividirse
4. La plataforma actualiza automáticamente el estado del grupo
5. Al finalizar, cada integrante ve: "Debés $18.500 a María" con el desglose de cómo se calculó

---

## Criterio de Éxito del Reto

Un usuario que nunca usó la plataforma puede completar estas 10 tareas **sin instrucciones externas:**

1. Crear un grupo
2. Invitar participantes
3. Registrar un gasto
4. Seleccionar quiénes participan
5. Definir cómo dividirlo
6. Consultar cuánto corresponde a cada persona
7. Visualizar sus deudas
8. Comprender de dónde surge cada importe
9. Registrar un pago
10. Identificar cuándo todas las cuentas están saldadas

**En términos de producto, la transformación es:**

> "Tenemos que hacer cuentas para saber quién le debe a quién."
> → "La plataforma nos muestra de forma clara cuánto corresponde pagar, a quién y por qué."

---

## Competencia de Referencia

Apps directas a investigar en benchmark:
- **Splitwise** — referente global; complejo pero completo ==**(NATHALY)**==
- **Tricount** — más simple, popular en Europa ==**(JULIÁN)**==
- **Tab** — enfoque en claridad visual **==(VANESA)==
- **Settle Up** — gestor de deudas entre grupos **==(RIDER)==**
- **Venmo / Mercado Pago splits** — integración de pago + división **==(FELI)==

---

## Notas de Diseño Iniciales

- El producto tiene un flujo de entrada claro: **crear grupo o unirse** — la pantalla inicial define todo el mental model
- El estado de las deudas requiere un patrón visual propio (no es solo un número — es relación + dirección + contexto)
- El flujo de carga de gasto es el momento más crítico: ahí se define toda la lógica; si es confuso, todo lo demás pierde sentido
- "Cómo dividirlo" es el mayor reto de UX: partes iguales / por consumo / porcentajes / monto fijo — balance entre flexibilidad y carga cognitiva
- Grupos grandes vs grupos pequeños pueden requerir vistas diferentes o progresiva disclosure

---

## Ver también

- **CLAUDE — SplitFlow**
- **COMMANDS — SplitFlow**
