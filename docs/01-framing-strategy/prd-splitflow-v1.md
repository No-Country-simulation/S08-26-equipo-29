---
kind: prd
project: splitflow
version: 1.0
tier: standard
date: 2026-09-03
status: draft
tags:
  - project/splitflow
  - type/prd
  - phase/framing
---

# PRD — SplitFlow v1

> **Tier:** Standard | **Owner:** Julian Rozo (Product Designer) | **Sprint:** No Country S08-26

---

## 1. TL;DR

SplitFlow es una app mobile para dividir gastos compartidos en grupos informales de LatAm. El diferenciador: cada saldo es trazable hasta los gastos que lo originaron — algo que ni Tricount ni Splitwise resuelven bien. El MVP (Producto Minimo Viable — la version mas pequena del producto que valida el problema) del sprint de 4 semanas cubre: crear grupo, registrar gasto, ver saldo con desglose. El backend (logica de negocio y base de datos) en Spring Boot + PostgreSQL ya esta scaffoldeado; el frontend (la interfaz que ve el usuario) esta por definir.

---

## 2. Press Release (invertido)

**SplitFlow muestra exactamente por que debes $25.000 — no solo cuanto**

Bogota, septiembre 2026 — Los grupos de amigos en LatAm tienen un problema que las apps existentes no resuelven: saben cuanto deben, pero no por que. SplitFlow es la primera app de gastos compartidos que conecta cada saldo con los gastos especificos que lo generaron, eliminando la desconfianza y las conversaciones incomodas.

"Con Tricount veia que debia $40.000, pero no sabia si era del alojamiento, el supermercado o la cena. Terminaba scrolleando toda la lista para entender," dice Camila Rodriguez, 24, estudiante en Bogota. "SplitFlow me muestra el desglose con un tap."

A diferencia de Splitwise (complejo) o Tricount (opaco en trazabilidad), SplitFlow resuelve el flujo completo — desde registrar quien pago hasta cerrar la deuda — sin requerir cuenta bancaria ni onboarding extenso.

---

## 3. FAQ

**P: Si Splitwise ya existe, por que construir otra app?**
R: Splitwise resuelve el calculo pero es complejo para grupos informales. Su onboarding, configuracion de divisiones y modelo freemium generan friccion en usuarios casuales de LatAm que solo quieren dividir un viaje de fin de semana.

**P: Tricount es simple — cual es el gap?**
R: Tricount optimiza transferencias (A le paga directo a B) pero sacrifica trazabilidad. El usuario no puede ver de donde surge su saldo sin reconstruirlo manualmente gasto por gasto. Nuestro benchmark lo confirma: es el gap mas consistente del lider simple del mercado.

**P: Necesita cuenta bancaria para funcionar?**
R: No. SplitFlow registra pagos como marca manual ("Mark as paid") igual que Tricount. La integracion con medios de pago reales es non-goal del MVP.

**P: Como se diferencia de un Excel compartido?**
R: El Excel no calcula divisiones automaticamente, no maneja multiples modos de reparto, no distingue estados de pago, y se desactualiza porque nadie lo alimenta. SplitFlow automatiza lo que el Excel requiere que hagas manualmente.

---

## 4. Problema y contexto

### El problema

Compartir gastos en grupo es cotidiano (viajes, restaurantes, casa compartida), pero el proceso de rastrear quien pago que, dividirlo correctamente y cobrar es manual, fragmentado y socialmente incomodo.

### Workarounds actuales

Los usuarios distribuyen la información en multiples canales: WhatsApp + notas del celular + Excel + calculadoras manuales + transferencias + memoria. El resultado: gastos olvidados, divisiones imprecisas, deudas sin rastrear, y conversaciones que nadie quiere tener.

### Evidencia de los 7 pain points

| # | Pain Point | Fuente | Severidad |
|---|---|---|---|
| PP-1 | Registro manual y desordenado en multiples canales | Brief | Alta |
| PP-2 | Division imprecisa (no todos consumen igual) | Brief | Alta |
| PP-3 | Falta de claridad sobre deudas (cuanto, a quien, por que) | Brief + Benchmark | Critica |
| PP-4 | Complejidad que escala con el tamano del grupo | Brief | Media |
| PP-5 | No hay seguimiento de estados de pago | Brief | Alta |
| PP-6 | Experiencia poco intuitiva en apps existentes | Brief + Benchmark | Media |
| PP-7 | Falta de contexto/desglose sobre importes | Brief + Benchmark Tricount | Critica |

### Contexto de negocio

- **Mercado:** Apps de division de gastos en LatAm — USD 0.6B (2024) creciendo a ~10.8% CAGR (tasa de crecimiento anual compuesta)
- **Plataforma:** No Country, simulacion laboral tech, sprint de 3-4 semanas
- **Equipo:** 1 desarrollador backend + 1 product designer + 1 UX (User Experience — experiencia de usuario) researcher + 2 disenadores UX/UI (User Interface — interfaz de usuario) + 1 QA (Quality Assurance — aseguramiento de calidad)

---

## 5. Jobs To Be Done (Trabajos Por Hacer)

> **JTBD** (Jobs To Be Done — Trabajos Por Hacer) es el marco que describe para que contrata el usuario un producto en su vida. No describe quien es el usuario ni que hace la app — describe la tarea real que quiere resolver. Formato: "Cuando \<situacion\>, quiero \<motivacion\> — para \<resultado esperado\>."

### JOB-01 (primario)

> Cuando comparto gastos en un viaje o salida grupal, quiero registrar quien pago que y ver exactamente cuanto debo y por que — para pagar mi parte sin conflicto y cobrar sin la conversacion incomoda.

### JOB-02 (secundario)

> Cuando el viaje termina, quiero ver un resumen claro de todas las deudas pendientes y marcar las que ya se saldaron — para cerrar el tema sin perseguir a nadie por WhatsApp.

---

## 6. Personas

### Proto-persona primaria: Camila Rodriguez

| Atributo       | Valor                                    |
| -------------- | ---------------------------------------- |
| Edad           | 22-28 años                               |
| Ocupacion      | Universitaria / profesional junior       |
| Ciudad         | Buenos Aires, Bogota, Santiago CDMX.     |
| Dispositivo    | Android (Samsung A-series, Motorola)     |
| Ingresos       | $500k-$2M COP/mes                        |
| Medios de pago | Nequi, Daviplata, transferencia bancaria |
|                |                                          |

**Quote:** "Yo pago, despues me dicen cuanto me deben... y nunca me pagan. O peor: nadie recuerda cuanto fue."

**Contextos activadores:** viaje grupal (4-8 personas), salidas a restaurante/bar, casa compartida, eventos sociales.

**Factores de abandono:** formulario >4 campos sin contexto, no ver quien debe a un vistazo, tener que explicar la app al grupo, no rastrear de donde surge el importe.

> Artefacto completo: `00 Discovery & Research/(C) Proto-Persona - SplitFlow.excalidraw`

---

## 7. Metricas de exito

### North Star

**Task completion rate:** porcentaje de las 10 tareas del criterio de exito completadas sin instrucciones externas, medido en sesiones de testing con usuarios de perfil Camila.

- Baseline: `[NEEDS INPUT]` — requiere primera ronda de testing en Maze
- Target MVP: >= 7/10 tareas completadas por >= 80% de los participantes

### Input metrics

| Metrica | Que mide | Target MVP |
|---|---|---|
| IM-1: Tiempo hasta primer gasto registrado | Velocidad de activacion | <= 3 min desde apertura |
| IM-2: Gastos registrados por sesion | Engagement con flujo core | >= 2 en sesion de prueba |
| IM-3: Comprension de saldo (Likert 1-5) | Claridad de la UI de desglose | >= 4.0 promedio |

### Guardrail

**Tiempo hasta primera accion exitosa:** no puede empeorar entre iteraciones. Si la task completion sube pero el tiempo se dispara, algo se rompio.

---

## 8. Non-goals

Cosas que SplitFlow **no** hara en esta version. Cada non-goal tiene su razon.

| # | Non-goal | Por que no |
|---|---|---|
| NG-1 | Integrar pagos reales (Nequi, PSE, transferencia) | Complejidad regulatoria + no necesario para resolver el JTBD core |
| NG-2 | Optimizar deudas cruzadas (algoritmo de neteo A->B->C) | Tricount lo hace pero sacrifica trazabilidad — priorizamos desglose claro |
| NG-3 | Soportar multiples monedas simultaneas en un grupo | Complejidad de conversion + caso de uso minoritario en LatAm |
| NG-4 | Notificaciones push / recordatorios automaticos | Requiere infraestructura mobile que excede el MVP |
| NG-5 | Importar datos de Splitwise/Tricount | Nice-to-have para v2, no critico para validar el JTBD |

---

## 9. Alcance por fases

### MVP (Sprint No Country — semanas 1-4)

El minimo funcional para validar el JTBD y presentar ante evaluadores.

- **Onboarding frictionless:** UUID anonimo auto-generado en primer lanzamiento, sin registro de email (REQ-SF-000)
- Crear grupo + invitar participantes (link o nombre)
- Registrar gasto: que, cuanto, quien pago, quienes participan, como dividir
- Modos de division: partes iguales, por monto especifico
- Ver saldo personal con **desglose trazable** (diferenciador)
- Ver saldo grupal (quien debe a quien)
- Marcar deuda como pagada (unilateral, sin confirmacion cruzada)
- Auth con email + JWT — **diferido a v1** (ver Decision Log 2026-09-08)

### v1 (post-sprint, si continua)

- Estados de pago con confirmacion mutua
- Historial de gastos con busqueda y filtros
- Division por porcentaje
- Vista personal vs. vista grupal diferenciadas
- Feedback inline en formulario de gasto ("$5.000 sin asignar")

### v2 (futuro)

- Multi-moneda con conversion automatica
- Integracion con medios de pago LatAm
- Analytics de grupo (graficas de distribucion)
- Optimizacion de deudas cruzadas (con toggle para mantener trazabilidad)

---

## 10. Priorizacion

### MoSCoW — MVP

> **MoSCoW** es un framework de priorizacion con cuatro categorias: **Must** (debe tener — sin esto no existe el producto), **Should** (deberia tener — importante pero no bloqueante), **Could** (podria tener — deseable si hay tiempo), **Won't** (no en esta version — descartado conscientemente).

| Prioridad | Feature | Justificacion |
|---|---|---|
| **Must** | Crear grupo + invitar | Sin grupo no hay producto (criterio 1-2) |
| **Must** | Registrar gasto con division | Flujo critico, corazon del JTBD (criterios 3-5) |
| **Must** | Saldo con desglose trazable | Diferenciador central, PP-3 y PP-7 (criterios 6-8) |
| **Must** | Marcar pago como saldado | Cierre del flujo completo (criterios 9-10) |
| **Should** | Division por monto especifico | PP-2, resuelve "no todos consumen igual" |
| **Should** | Empty states con guia | PP-6, onboarding implicito |
| **Could** | Foto de recibo adjunta al gasto | Contexto adicional, no critico |
| **Won't** | Notificaciones push | NG-4 |
| **Won't** | Optimizacion de deudas | NG-2 |

### RICE — Top 5 features MVP

> **RICE** es un modelo cuantitativo de priorizacion: **Reach** (alcance — cuantos usuarios impacta), **Impact** (impacto — cuanto mueve el North Star, escala 0.25/0.5/1/2/3), **Confidence** (confianza en los datos — 0 a 1), **Effort** (esfuerzo en semanas-persona). Score = (Reach × Impact × Confidence) / Effort. Mayor score = mayor prioridad.

| Feature | Reach | Impact | Confidence | Effort | Score |
|---|---|---|---|---|---|
| Saldo con desglose trazable | 10 | 3 | 0.8 | 2 | **12.0** |
| Registro de gasto (division igual) | 10 | 3 | 1.0 | 2 | **15.0** |
| Crear grupo + invitar | 10 | 3 | 1.0 | 1 | **30.0** |
| Mark as paid | 8 | 2 | 0.8 | 1 | **12.8** |
| Division por monto especifico | 6 | 2 | 0.7 | 2 | **4.2** |

---

## 11. Requisitos funcionales (EARS)

> **EARS** (Easy Approach to Requirements Syntax — Sintaxis Simplificada para Requisitos) es un formato estandar de ingenieria de software que expresa cada requisito con una estructura fija: *Cuando* \<disparador\>, *el sistema debe* \<respuesta\>. Esto hace que cada requisito sea verificable — QA puede escribir un test exacto para cada uno. El ID `REQ-SF-XXX` permite trazar cada requisito a pantallas de diseno, tests de QA y endpoints de la API.

### Autenticacion

**REQ-SF-000** *(nuevo)* — Cuando un usuario abre la app por primera vez, el sistema debe generar automaticamente un UUID unico como identidad anonima, persistirlo localmente en el dispositivo, y permitir el acceso inmediato a la app sin requerir email ni contrasena.

**REQ-SF-001** *(diferido a v1)* — ~~Cuando un usuario nuevo envia el formulario de registro con correo electronico y contrasena, el sistema debe crear la cuenta, generar un token JWT y redirigir a la pantalla principal.~~ — *Reemplazado por REQ-SF-000 en MVP. La autenticacion con email es non-goal del MVP — ver Decision Log 2026-09-08.*

**REQ-SF-002** *(diferido a v1)* — ~~Cuando un usuario registrado envia credenciales validas en el formulario de inicio de sesion, el sistema debe autenticar al usuario y retornar un token JWT valido.~~ — *Diferido junto con REQ-SF-001.*

### Grupos

**REQ-SF-003** — Cuando un usuario crea un nuevo grupo con un nombre, el sistema debe crear el grupo con el creador como primer miembro activo y mostrarlo en su lista de grupos. Opcionalmente, el creador puede agregar nombres o aliases de participantes durante la creacion — el sistema los registra como miembros placeholder en estado "sin reclamar" hasta que cada uno los reclame a traves del recurso de invitacion.

**REQ-SF-004a** — Cuando un participante accede al enlace de invitacion de un grupo que tiene aliases en estado "sin reclamar" (Modo A), el sistema debe mostrar la lista de aliases disponibles y permitir que el participante seleccione el suyo — asociandolo a su UUID y actualizando su estado a activo.

**REQ-SF-004b** — Cuando un participante accede al enlace de invitacion de un grupo sin aliases pre-cargados (Modo B), el sistema debe permitir que el participante ingrese su propio nombre o alias y lo registra como nuevo miembro activo asociado a su UUID.

**REQ-SF-005** — Cuando un usuario abre un grupo, el sistema debe mostrar la lista de gastos, el resumen de saldos y la lista de miembros.

### Registro de gasto

**REQ-SF-006** — Cuando un usuario registra un nuevo gasto, el sistema debe requerir: descripcion, monto, pagador, participantes y metodo de division.

**REQ-SF-007** — Cuando el usuario selecciona "partes iguales" como metodo de division, el sistema debe dividir el monto total en partes iguales entre todos los participantes seleccionados.

**REQ-SF-008** — Cuando el usuario selecciona "por monto" como metodo de division, el sistema debe permitir especificar un monto personalizado por participante y debe validar que la suma sea igual al total del gasto.

**REQ-SF-009** — Mientras el usuario ingresa montos en modo "por monto", el sistema debe mostrar el saldo sin asignar en tiempo real (ej. "$5.000 sin asignar").

### Saldos y desglose

**REQ-SF-010** — Cuando un usuario visualiza un grupo, el sistema debe mostrar el saldo neto de cada miembro (positivo = le deben dinero; negativo = debe dinero).

**REQ-SF-011** — Cuando un usuario toca su propio saldo, el sistema debe mostrar el desglose trazable con cada gasto que contribuyo a ese saldo, incluyendo descripcion, fecha y monto individual.

**REQ-SF-012** — Cuando un usuario visualiza los saldos del grupo, el sistema debe mostrar los pares de deuda direccionales: "A le debe $X a B" por cada deuda pendiente.

### Pagos y cierre

**REQ-SF-013** — Cuando un usuario marca una deuda como pagada, el sistema debe actualizar el saldo de ambas partes y mover la deuda al estado "saldada".

**REQ-SF-014** — Cuando todas las deudas de un grupo alcanzan el estado "saldada", el sistema debe mostrar un indicador visual de que las cuentas del grupo estan completamente cerradas.

---

## 12. Criterios de aceptacion (Gherkin)

> **Gherkin** es un lenguaje de especificacion de comportamiento que usa tres palabras clave: **Given** (dado — el estado inicial del sistema), **When** (cuando — la accion del usuario), **Then** (entonces — el resultado esperado). Cada escenario es un test ejecutable: QA lo toma directamente para verificar que el requisito funciona en la app real.

### Registro de gasto — flujo critico

```gherkin
Feature: Registrar un gasto compartido

  Scenario: Gasto con division igualitaria
    Given el usuario esta autenticado y dentro de un grupo con 4 participantes
    When registra un gasto de $100.000 con division "partes iguales" y 4 participantes seleccionados
    Then el sistema asigna $25.000 a cada participante
    And el gasto aparece en la lista del grupo con descripcion, monto y pagador
    And los saldos de todos los participantes se actualizan

  Scenario: Gasto con division por monto especifico
    Given el usuario esta dentro de un grupo con 3 participantes
    When registra un gasto de $60.000 con division "por monto"
    And asigna $20.000 a A, $15.000 a B, y $25.000 a C
    Then el sistema valida que $20.000 + $15.000 + $25.000 = $60.000
    And registra el gasto con los montos individuales asignados

  Scenario: Montos que no cuadran
    Given el usuario esta en modo "por monto" con un gasto de $60.000
    When la suma de montos asignados es $55.000
    Then el sistema muestra "$5.000 sin asignar" en tiempo real
    And el boton de guardar permanece deshabilitado
```

### Desglose trazable — diferenciador

```gherkin
Feature: Ver desglose trazable de saldo

  Scenario: Usuario consulta por que debe ese monto
    Given el usuario tiene un saldo de -$43.000 en el grupo "Viaje Melgar"
    When toca sobre su saldo
    Then ve una lista de gastos que originaron esa deuda:
      | Gasto         | Monto individual |
      | Alojamiento   | $25.000          |
      | Supermercado  | $10.000          |
      | Transporte    | $8.000           |
    And la suma de los montos individuales es igual al saldo total
```

### Cierre de deuda

```gherkin
Feature: Marcar deuda como pagada

  Scenario: Cierre unilateral de deuda
    Given el usuario A debe $25.000 a B en el grupo "Viaje Melgar"
    When A marca la deuda como "pagada"
    Then el saldo de A con B se actualiza a $0
    And la deuda aparece como "saldada" en el historial
    And el grupo muestra el estado actualizado para todos los miembros
```

---

## 13. Requisitos no funcionales

> Los **NFR** (Non-Functional Requirements — Requisitos No Funcionales) no describen *que hace* el sistema, sino *como se comporta*: rendimiento, seguridad, accesibilidad y compatibilidad. Son igual de importantes que los funcionales — si la app es lenta o insegura, el producto falla aunque todas las features existan.

| ID | Categoria | Requisito |
|---|---|---|
| NFR-01 | Rendimiento | La pantalla de saldos del grupo carga en menos de 2 segundos con hasta 50 gastos |
| NFR-02 | Rendimiento | El calculo del desglose trazable responde en menos de 500ms |
| NFR-03 | Seguridad | Todos los endpoints de la API requieren token JWT valido, excepto `/auth/register` y `/auth/login` |
| NFR-04 | Seguridad | Las contrasenas se almacenan con bcrypt (algoritmo de cifrado unidireccional, minimo 10 rondas de procesamiento) |
| NFR-05 | Datos | Precision monetaria de 2 decimales; redondeo documentado con tolerancia de 1 centavo (ej. $100 entre 3 = $33,34 + $33,33 + $33,33) |
| NFR-06 | Accesibilidad | Contraste minimo nivel AA segun WCAG 2.1 (Web Content Accessibility Guidelines — estandar internacional de accesibilidad web) en todos los textos sobre fondos |
| NFR-07 | Compatibilidad | `[PENDIENTE]` — version minima de Android a soportar depende de la decision de plataforma (NI-1) |

---

## 14. Modelo de datos y contratos

### Entidades principales

```
User
  - id: UUID (PK)
  - email: String (unique)
  - password_hash: String
  - display_name: String
  - created_at: Timestamp

Group
  - id: UUID (PK)
  - name: String
  - currency: String (default: "COP")
  - created_by: UUID (FK -> User)
  - created_at: Timestamp

GroupMember
  - group_id: UUID (FK -> Group)
  - user_id: UUID (FK -> User)
  - joined_at: Timestamp
  - PK: (group_id, user_id)

Expense
  - id: UUID (PK)
  - group_id: UUID (FK -> Group)
  - description: String
  - total_amount: Decimal(12,2)
  - paid_by: UUID (FK -> User)
  - split_method: Enum (EQUAL, BY_AMOUNT)
  - created_at: Timestamp

ExpenseSplit
  - id: UUID (PK)
  - expense_id: UUID (FK -> Expense)
  - user_id: UUID (FK -> User)
  - amount: Decimal(12,2)

Payment
  - id: UUID (PK)
  - group_id: UUID (FK -> Group)
  - from_user: UUID (FK -> User)
  - to_user: UUID (FK -> User)
  - amount: Decimal(12,2)
  - status: Enum (PENDING, SETTLED)
  - settled_at: Timestamp (nullable)
```

### Contrato API (existente en repo)

| Metodo | Endpoint | Descripcion |
|---|---|---|
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/login` | Login, retorna JWT |
| POST | `/api/groups` | Crear grupo |
| GET | `/api/groups/{id}` | Detalle de grupo + miembros |
| POST | `/api/groups/{id}/members` | Agregar miembro |
| POST | `/api/groups/{id}/expenses` | Registrar gasto con `ExpenseSplit` |
| GET | `/api/groups/{id}/expenses` | Listar gastos del grupo |
| GET | `/api/groups/{id}/balances` | Saldos netos + desglose trazable |
| POST | `/api/groups/{id}/payments` | Registrar pago para saldar deuda |

**Endpoint nuevo propuesto:**

| Metodo | Endpoint | Descripcion | Justificacion |
|---|---|---|---|
| GET | `/api/groups/{id}/balances/{userId}/breakdown` | Desglose trazable del saldo de un usuario | REQ-SF-011, diferenciador |

---

## 15. Stack tecnico

### Stack actual (repo S08-26-equipo-29)

| Capa | Tecnologia | Estado |
|---|---|---|
| Backend | Java 21 + Spring Boot + Spring Data JPA (Java Persistence API — capa que conecta el codigo Java con la base de datos) + Spring Security (JWT) + Maven (herramienta de compilacion) | Scaffoldeado |
| Frontend | React + Vite (empaquetador de modulos — convierte el codigo en archivos listos para el navegador) + Bootstrap | Scaffoldeado (web) |
| Database | PostgreSQL | Configurado |
| Arquitectura | Monorepo (`backend/`, `frontend/`, `database/`, `docs/`) | Definido |
| Requisitos | JDK 21+, Node 20+, PostgreSQL, Maven | Documentado |
| Branching | `dev` (diario) + `main` (entregas estables) | Activo |

### Evaluacion y recomendaciones

| Componente | Estado actual | Recomendacion | Prioridad |
|---|---|---|---|
| Backend (Spring Boot) | Adecuado | Mantener. JPA mapea bien el dominio relacional. Agregar validaciones y codigos de error estandar | Baja |
| Frontend (React + Vite) | Web, no mobile | **Decision critica:** ver seccion de riesgos. Opciones: (A) PWA (Progressive Web App — app web instalable en el celular) responsive con Tailwind, (B) migrar a React Native + Expo | Critica |
| Bootstrap | Datado para mobile-first | Reemplazar por Tailwind CSS (web) o NativeWind (si React Native) | Alta |
| PostgreSQL | Perfecto | Mantener. Agregar indices en `expense.group_id` y `expense_split.expense_id` | Baja |
| Testing | No configurado | Agregar: JUnit (backend) + Vitest o Jest (frontend) + al menos 1 test E2E del flujo de gasto | Media |

---

## 15b. Glosario tecnico para el equipo de diseno

> Esta seccion existe para que el equipo de diseno pueda hablar el mismo idioma que el backend sin perder tiempo. Conocer estos conceptos orienta decisiones de UX: que estados hay que disenar, que errores pueden ocurrir, que datos estan disponibles y cuando.

### La arquitectura en una frase

El **backend** (Spring Boot) es el cerebro: recibe peticiones, hace calculos, guarda datos y devuelve respuestas. El **frontend** (React / React Native) es la cara: muestra esos datos al usuario y envia sus acciones al backend. La **base de datos** (PostgreSQL) es la memoria: guarda todo de forma persistente.

```
[Usuario] → [Frontend / App] → [API REST / Backend] → [Base de datos]
[Usuario] ← [Frontend / App] ← [API REST / Backend] ← [Base de datos]
```

### Conceptos clave

**REST API / Endpoint**
Una API REST es el contrato entre frontend y backend. Funciona como un menú de restaurante: el frontend pide algo (con un metodo HTTP), el backend lo procesa y lo devuelve como texto estructurado (JSON). Un *endpoint* es una URL especifica que hace una cosa concreta — por ejemplo `GET /api/groups/{id}/balances`.

Implicacion para diseno: cada pantalla que muestre datos necesita un endpoint que los entregue. Si el diseno muestra el desglose de saldo, el backend necesita un endpoint para calcularlo. Por eso propusimos el endpoint nuevo en §14 — el diferenciador requiere un contrato de API nuevo.

---

**JSON (JavaScript Object Notation)**
El formato en que backend y frontend se hablan. Es texto plano estructurado en pares clave-valor. Ejemplo de lo que devolveria el endpoint de desglose:

```json
{
  "userId": "abc-123",
  "balance": -43000,
  "breakdown": [
    { "expense": "Alojamiento", "amount": 25000 },
    { "expense": "Supermercado", "amount": 10000 },
    { "expense": "Transporte", "amount": 8000 }
  ]
}
```

Implicacion para diseno: el JSON define exactamente que datos existen. Si el diseno muestra un campo que el backend no devuelve (ej. un icono de categoria por gasto), hay que negociarlo con Rider — es un cambio de contrato.

---

**JWT (JSON Web Token)**
Un token es como una pulsera de acceso: el backend la emite al hacer login, y el frontend la incluye en cada peticion para demostrar que el usuario esta autenticado. Expira despues de un tiempo configurado.

Implicaciones para diseno:
- Hay que disenar el estado de **sesion expirada**: ¿que ve el usuario cuando el token vencio? (pantalla de login, no un error tecnico crudo)
- La app no debe perder el progreso del usuario si la sesion expira mientras llena el formulario de gasto — considerar guardar borrador localmente
- El boton "Cerrar sesion" invalida el token del lado cliente y redirige a login

---

**Spring Boot**
El framework de Java con el que esta construido el backend de SplitFlow. Para el equipo de diseno es una caja negra — lo que importa son los endpoints que expone (§14) y los tiempos de respuesta (NFR-01, NFR-02).

Implicacion para diseno: Spring Boot en un servidor free-tier puede tener un "cold start" — la primera peticion tarda varios segundos si el servidor estuvo inactivo. Hay que disenar un estado de carga inicial visible (splash o skeleton) para que el usuario no piense que la app crasheo.

---

**PostgreSQL / Base de datos relacional**
Una base de datos relacional organiza la informacion en tablas vinculadas entre si, como hojas de calculo que se referencian mutuamente. Ejemplo: la tabla `Expense` se relaciona con `ExpenseSplit` — sin el gasto padre, el split no puede existir.

Implicaciones para diseno:
- Los datos tienen **integridad referencial**: al eliminar un gasto, todos sus splits desaparecen. El diseno de la confirmacion de eliminacion debe comunicar ese efecto en cascada
- Las relaciones determinan que datos se pueden mostrar juntos sin llamadas extra al backend — el diseno de pantallas complejas debe negociarse con Rider

---

**Spring Data JPA / ORM**
Una capa de codigo que traduce entre Java (objetos) y la base de datos (SQL). Permite al backend "buscar todos los gastos de un grupo" sin escribir SQL manual.

Implicacion para diseno: las vistas de datos complejos (como el desglose trazable) requieren queries elaboradas. Si el diseno requiere cruzar muchas tablas en una sola pantalla, comunicarselo a Rider con anticipacion — algunas queries son costosas en tiempo de respuesta y pueden afectar NFR-01.

---

**Enum / Estados finitos**
Un Enum es una lista cerrada de valores posibles para un campo. Por ejemplo, `split_method: Enum(EQUAL, BY_AMOUNT)` significa que solo existen esos dos modos — no hay un tercero a menos que se modifique el codigo.

Implicacion para diseno: los estados de UI que diseñes deben mapear a estados que existan en el modelo de datos. Si diseñas un estado de pago "PAGO PARCIAL", hay que agregarlo al Enum `Payment.status` — eso es un cambio de backend que requiere tiempo. Ver §14 para los Enums actuales del sistema.

---

**Monorepo**
Un unico repositorio de codigo que contiene backend, frontend y base de datos. Todos trabajan del mismo lugar; los cambios al contrato de API son visibles para todo el equipo.

Implicacion para diseno: el equipo de diseno puede revisar `docs/API.md` en el mismo repo para ver el contrato actualizado. Si hay un cambio de endpoint, queda documentado ahi — no hay que pedirle a Rider que lo explique por WhatsApp.

---

**HTTP Methods (verbos de la API)**

| Verbo | Que hace | Ejemplo en SplitFlow | Impacto en UX |
|---|---|---|---|
| GET | Lee datos sin modificar nada | Ver saldos del grupo | Puede tener loading state; seguro de reintentar |
| POST | Crea algo nuevo | Registrar un gasto | Accion irreversible — considerar confirmacion |
| PUT / PATCH | Modifica algo existente | Actualizar estado de pago | Accion que cambia estado — feedback claro |
| DELETE | Elimina algo | Eliminar un gasto | Accion destructiva — siempre confirmar antes de ejecutar |

---

**UUID (Universally Unique Identifier)**
Un identificador unico para cada entidad, con formato `550e8400-e29b-41d4-a716-446655440000`. Cada grupo, gasto, usuario y pago tiene el suyo.

Implicacion para diseno: los links de invitacion al grupo usaran el UUID del grupo. No son URLs legibles como `/grupo/viaje-melgar` — son algo como `/grupos/550e8400-e29b-41d4...`. Si el diseno requiere URLs amigables, es trabajo extra de backend.

---

**Variables de entorno / .env**
Archivos locales que guardan credenciales sensibles (contrasena de base de datos, clave JWT) que nunca se suben al repositorio. Existen como `.env.example` para que cada integrante sepa que configurar.

Implicacion para diseno: si el backend "no conecta" en la maquina de alguien, lo primero que revisar es si tienen el `.env` configurado — no es un bug de codigo, es configuracion local.

---

## 15c. Consideraciones de diseno mobile — iOS + Android

> SplitFlow corre en React Native: un solo codigo base para ambas plataformas. Pero iOS y Android tienen convenciones distintas que los usuarios asumen inconscientemente. Esta seccion define las reglas que el equipo de diseno debe seguir para que la app se sienta natural en ambas plataformas sin duplicar el trabajo.

### Filosofia de cada plataforma

| | iOS (HIG — Human Interface Guidelines, guia oficial de Apple) | Android (Material Design 3, guia oficial de Google) |
|---|---|---|
| Principio | Elegancia, consistencia, experiencia gestual | Control, personalizacion, expresividad visual |
| Navegacion | Gestos + Tab bar fijo en el fondo | Boton back (hardware/gesto) + Bottom navigation |
| Profundidad visual | Blur, transparencia, capas | Elevation (elevacion simulada), sombras, FAB (Floating Action Button — boton flotante de accion principal) |
| Tono | Minimalista, espacio en blanco generoso | Color prominente, componentes con peso visual |

**Enfoque recomendado para el sprint:** Parity design (diseno por paridad) — un diseno consistente en ambas plataformas, con ajustes minimos de navegacion obligatorios. Prioriza iOS como referencia visual por su minimalismo (alineado con el caso de uso financiero), y adapta Android en los puntos criticos detallados abajo.

---

### 1. Navegacion

**iOS**
- Tab bar permanente en la parte inferior con 3–5 items maximos
- Swipe desde el borde izquierdo para retroceder (Back gesture nativo)
- Sin boton de back fisico — el icono de back esta en la navigation bar superior

**Android**
- Bottom navigation (similar al tab bar de iOS) — patron Material 3
- Boton de back disponible: gesto desde cualquier borde o boton en la barra de sistema
- **Critico:** la app debe manejar el back button correctamente en cada pantalla — si no, el usuario queda atrapado en un modal o cierra la app accidentalmente

**Arquitectura de navegacion recomendada para SplitFlow:**
```
[Tab: Grupos]  [Tab: Perfil]
     ↓
  Lista de grupos
     ↓
  Detalle de grupo  (Stack)
     ↓
  Registrar gasto / Ver desglose  (Stack)
```

En Android: el back button en "Detalle de grupo" regresa a "Lista de grupos", no cierra la app. Verificar este comportamiento en QA.

---

### 2. Targets de toque minimos

| Plataforma | Minimo recomendado | Fuente |
|---|---|---|
| iOS | 44 × 44 pt | Apple Human Interface Guidelines |
| Android | 48 × 48 dp | Material Design 3 |

**Regla para SplitFlow:** disenar todos los elementos interactivos con area de toque de **minimo 48 × 48 dp**. Elementos criticos donde esto suele fallar:
- Checkboxes de participantes en el formulario de gasto (muchos, en espacio reducido)
- Boton "Mark as paid" en la vista de saldos
- Iconos de accion en filas de la lista de gastos

---

### 3. Safe areas (areas seguras)

Las pantallas modernas tienen elementos fisicos y de software que recortan el area de contenido: Dynamic Island y notch (iPhone), home indicator inferior (iOS), barra de gestos (Android), bordes redondeados.

**En React Native:** usar `SafeAreaView` de `react-native-safe-area-context` — maneja automaticamente los insets de ambas plataformas.

Reglas de diseno:
- Nunca posicionar botones primarios a menos de 16dp del borde inferior sin contar el safe area
- El boton flotante de "Agregar gasto" debe respetar el safe area inferior — en iPhones recientes son ~34pt adicionales
- El contenido principal nunca debe quedar detras del Dynamic Island o notch

---

### 4. Tipografia

| Plataforma | Fuente del sistema | Caracteristica |
|---|---|---|
| iOS | SF Pro (San Francisco) | Optical sizing automatico, pesos 100–900 |
| Android | Roboto / Google Sans | Material 3, variable font en Android 12+ |

**Recomendacion para SplitFlow:** usar una **fuente custom** (Inter o Plus Jakarta Sans) incluida en el bundle de React Native. Garantiza paridad visual identica en ambas plataformas sin manejar diferencias de renderizado por sistema operativo.

Escala tipografica minima para elementos financieros:

| Uso | Tamano minimo | Razon |
|---|---|---|
| Montos de dinero (balance, totales) | 16sp | Legibilidad critica — error de lectura genera conflicto |
| Labels de campos de formulario | 14sp | Estandar WCAG de accesibilidad |
| Texto de listas (descripcion de gasto) | 14sp | Lectura rapida en scroll |
| Etiquetas de estado (badges, chips) | 12sp | Solo para elementos no criticos |

---

### 5. Componentes que se comportan diferente entre plataformas

| Componente | iOS | Android | Decision para SplitFlow |
|---|---|---|---|
| Switch (toggle) | Verde, circular, animacion slide | Material 3, thumb + track coloreado | Usar `Switch` nativo de RN — adapta automaticamente |
| Date picker | Rueda (spinner) | Calendar o input texto | Usar `@react-native-community/datetimepicker` — maneja ambas plataformas |
| Alert / Dialog | Modal centrado, botones horizontales | Dialog con botones de texto alineados a la derecha | Usar `Alert.alert()` de RN — se adapta por plataforma |
| Loading indicator | Spinner circular | Spinner circular (en RN es el mismo `ActivityIndicator`) | Sin diferencias en RN |
| Swipe-to-delete | Patron nativo esperado por usuarios iOS | Menos esperado — preferir boton de accion alternativo | Implementar swipe en iOS; en Android agregar accion tap visible |

---

### 6. Teclado numerico — critico para el formulario de gasto

El formulario de gasto es el flujo mas critico de SplitFlow. El tipo de teclado que aparece al tocar el campo de monto define la experiencia.

**Configuracion correcta en React Native:**
```js
// Campo de monto — CORRECTO
keyboardType="decimal-pad"   // Numeros + separador decimal, sin letras
returnKeyType="done"         // Boton "Listo/Done" en lugar de Enter

// INCORRECTO — nunca para un campo de monto
keyboardType="default"       // Muestra teclado completo con letras
```

**Diferencias por plataforma:**
- iOS `decimal-pad`: numeros + un punto decimal, limpio y controlado
- Android `numeric`: variable segun teclado del fabricante — puede incluir coma, punto, signo negativo

**Dos problemas de diseno que hay que resolver:**
1. Al abrir el teclado, los campos inferiores del formulario quedan ocultos. Solucionar con `KeyboardAvoidingView`:
   ```js
   behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
   ```
2. El feedback inline "X sin asignar" (REQ-SF-009) debe ser visible incluso con el teclado abierto — posicionarlo encima del teclado, no debajo de los campos.

---

### 7. Listas largas — rendimiento

La lista de gastos de un grupo puede tener 50+ items en escenarios reales (brief: "10 personas + 35 gastos").

| Componente | Cuando usarlo | Por que |
|---|---|---|
| `FlatList` | Listas de gastos, miembros, grupos | Virtualiza — solo renderiza items visibles. Eficiente con cualquier volumen |
| `ScrollView` | Formularios con pocos campos fijos | Renderiza todo de una vez — solo viable con contenido acotado |

**Regla:** todas las listas de gastos, grupos y miembros usan `FlatList`. `ScrollView` solo para formularios.

---

### 8. Dark mode

Ambas plataformas soportan dark mode. React Native detecta el modo con `useColorScheme()`.

**Estrategia para el sprint:** disenar primero en light mode, pero definir **tokens semanticos de color desde el inicio**. Esto evita refactoring cuando se agregue dark mode en v1.

| Token semantico | Light | Dark |
|---|---|---|
| `color-background` | `#F5F1E6` | `#1A1A1A` |
| `color-surface` | `#F7F4EB` | `#27272A` |
| `color-text-primary` | `#27272A` | `#F4F4F5` |
| `color-text-secondary` | `#52525B` | `#A1A1AA` |
| `color-accent` | `#5D5FEF` | `#7B7EF8` |
| `color-border` | `#D4D4D8` | `#3F3F46` |

---

### 9. Densidades de pantalla

Android tiene multiples densidades (mdpi, hdpi, xhdpi, xxhdpi). React Native usa `dp` que escalan automaticamente.

**Reglas:**
- Disenar en Figma a **1x con unidades dp** (equivalentes a pt de iOS en RN)
- Exportar assets (iconos, imagenes) en @1x, @2x y @3x para cubrir todas las densidades
- Probar en un dispositivo Samsung A-series fisico o emulado — es el dispositivo de Camila (perfil de la proto-persona)

---

### 10. Checklist de entrega — antes de pasar cualquier pantalla a desarrollo

**Requisitos generales (ambas plataformas)**
- [ ] Todos los elementos interactivos tienen area de toque >= 48dp
- [ ] Los montos se muestran con 2 decimales y separador de miles (`$25.000,00`)
- [ ] Hay un **empty state** disenado para cada lista (grupos vacios, sin gastos, sin miembros)
- [ ] Hay un **estado de error** para cada llamada a la API (error de red, error de servidor, token expirado)
- [ ] Hay un **estado de carga** (skeleton o spinner) para datos que vienen del backend

**iOS especifico**
- [ ] Navigation bar superior tiene titulo correcto y boton de back donde corresponde
- [ ] El home indicator (~34pt inferior) esta fuera del area de contenido clickeable
- [ ] Los swipe gestures de la UI no entran en conflicto con el swipe back del sistema

**Android especifico**
- [ ] El boton de back del sistema regresa al nivel anterior del stack (no cierra la app desde pantallas internas)
- [ ] Los dialogos de confirmacion tienen botones de texto plano (no botones grandes llenos de color)
- [ ] La pantalla se ve correctamente en aspect ratios 20:9 (Samsung A-series, tipico en LatAm)
- [ ] Las acciones disponibles por swipe tienen una alternativa visible por tap (no depender solo de swipe)

---

## 16. Riesgos y mitigaciones

| # | Riesgo | Probabilidad | Impacto | Mitigacion |
|---|---|---|---|---|
| R-1 | **No hay frontend developer en el equipo** — 4 disenadores + 1 backend + 1 QA. Nadie asignado a construir la interfaz | Alta | Critico | Opciones: (a) Julian asume frontend como parte de transicion Design Engineer, (b) Rider extiende scope a fullstack, (c) se incorpora un dev. Decidir en los primeros 3 dias |
| R-2 | **Web vs Mobile no resuelto** — el repo tiene React web pero el equipo quiere mobile | Alta | Alto | Decidir en la primera sesion tecnica. Recomendacion: PWA responsive si no hay experiencia React Native en el equipo |
| R-3 | **Sprint de 4 semanas con scope ambicioso** — MVP tiene 14 requisitos funcionales | Media | Alto | Priorizar Must (MoSCoW). Si el tiempo aprieta, recortar "by amount" split y dejar solo "equal split" |
| R-4 | **Calculos monetarios con errores de redondeo** — divisiones que no cuadran generan desconfianza | Media | Alto | NFR-05: precision de 2 decimales, redondeo documentado, validacion suma = total en backend |
| R-5 | **Desglose trazable requiere query complejo** — join de Expense + ExpenseSplit + Payment por usuario | Baja | Medio | Endpoint dedicado (`/balances/{userId}/breakdown`), query optimizado con indices |

---

## 17. Rollout e instrumentacion

### Plan de sprint (4 semanas)

| Semana | Backend | Frontend / Diseno | QA |
|---|---|---|---|
| 1 | Auth (autenticacion) + modelo de datos + CRUD (Create, Read, Update, Delete — operaciones basicas de datos) de grupos | Wireframes de los 3 flujos core en Figma + decision de plataforma | Plan de testing alineado a los 10 criterios de exito |
| 2 | CRUD de gastos + logica de division + calculo de saldos | Pantallas de alta fidelidad + implementacion de grupo y gasto | Tests unitarios del backend |
| 3 | Desglose trazable + pagos + cierre de deuda | Implementacion de saldos + desglose + pagos | Tests E2E (End-to-End — pruebas del flujo completo de principio a fin) |
| 4 | Correccion de bugs + deploy (despliegue a servidor) + optimizacion | Polish de UI + ajustes responsive/mobile + integracion final | Sesion de testing en Maze con 5 usuarios de perfil similar a Camila |

### Instrumentacion minima

| Evento | Que mide | Donde |
|---|---|---|
| `group_created` | Activacion | POST `/groups` |
| `expense_registered` | Engagement core | POST `/expenses` |
| `balance_breakdown_viewed` | Uso del diferenciador | GET `/balances/{userId}/breakdown` |
| `payment_marked_settled` | Cierre de flujo | POST `/payments` |
| `task_completion_{1-10}` | North Star proxy | Sesion Maze |

---

## 18. Registro de incognitas

| # | Incognita | Impacta a | Quien la resuelve | Deadline |
|---|---|---|---|---|
| `[NI-1]` | Plataforma final: web responsive (PWA) vs React Native | R-2, NFR-07, stack completo | Equipo completo | Semana 1, dia 2 |
| `[NI-2]` | Quien construye el frontend | R-1, plan de sprint | Julian + Rider | Semana 1, dia 1 |
| `[NI-3]` | Baseline de task completion rate | North Star target | Testing con Maze | Semana 4 |
| `[NI-4]` | Confirmacion mutua de pago: si o no para MVP | REQ-SF-013 | Equipo de diseno | Semana 1 |
| `[NI-5]` | Nivel minimo de Android API si se va mobile | NFR-07 | Dev lead | Semana 1 |

---

## 19. Decision Log

| Fecha | Decision | Contexto | Tomada por |
|---|---|---|---|
| 2026-09-02 | Paleta Zinc + Indigo para artefactos visuales | Reemplaza semaforo semantico (rojo/ambar/verde) | Julian |
| 2026-09-02 | 6 dimensiones de benchmarking mapeadas a pain points | Framework para que cada miembro analice un competidor | Julian + Claude |
| 2026-09-03 | Proto-persona Camila Rodriguez como filtro de decisiones | Sintetizada del brief + benchmark + datos de mercado | Julian + Claude |
| 2026-09-03 | Non-goal: no optimizar deudas cruzadas en MVP | Priorizar trazabilidad sobre reduccion de transferencias | Julian |
| 2026-09-03 | Non-goal: no integrar pagos reales | Reducir scope y riesgo regulatorio | Julian |
| 2026-09-03 | Desglose trazable como diferenciador central | Gap confirmado en benchmark de Tricount (PP-7) | Julian |
| 2026-09-08 | **Onboarding frictionless — auth con email diferido a v1** | El usuario abre la app y opera de inmediato con un UUID anonimo auto-generado. No hay pantalla de registro ni login en el MVP. La identidad anonima se persiste localmente; la autenticacion con email, notificaciones push y perfil completo son non-goals del MVP. Impacta: REQ-SF-000 (nuevo), REQ-SF-001/002 (diferidos), §9 (MVP scope), CE-1 (precondicion). Riesgo nuevo: perdida de datos si el usuario reinstala la app o cambia de dispositivo — el UUID no se transfiere. | Julian |
| 2026-09-08 | **Sistema de aliases en creacion de grupo e invitacion (dos modos de union)** | Al crear un grupo, el creador puede (opcionalmente) agregar nombres/aliases de los participantes — quedan como placeholders "sin reclamar". Al unirse via enlace: Modo A (aliases pre-cargados) el participante selecciona su alias de la lista; Modo B (sin aliases) el participante ingresa el suyo. El alias queda vinculado al UUID del dispositivo y se propaga a todas las pantallas del flujo. Impacta: REQ-SF-003 (actualizado), REQ-SF-004 dividido en 004a y 004b, CE-1 Input, CE-2 completo. | Julian |

---

## 20. Trazabilidad

Mapeo de requisitos a pain points, criterios de exito y jobs.

| REQ | Pain Points | Criterios de exito | Job |
|---|---|---|---|
| REQ-SF-000 | — | CE-1 (precondicion) | Prereq frictionless (UUID auto-generado) |
| REQ-SF-001, 002 | — | — | Diferidos a v1 — reemplazados por REQ-SF-000 en MVP |
| REQ-SF-003, 004 | PP-4 | CE-1, CE-2 | JOB-01 |
| REQ-SF-006, 007, 008 | PP-1, PP-2 | CE-3, CE-4, CE-5 | JOB-01 |
| REQ-SF-009 | PP-2, PP-6 | CE-5 | JOB-01 |
| REQ-SF-010, 012 | PP-3 | CE-6, CE-7 | JOB-01 |
| REQ-SF-011 | PP-3, PP-7 | CE-8 | JOB-01, JOB-02 |
| REQ-SF-013 | PP-5 | CE-9 | JOB-02 |
| REQ-SF-014 | PP-5 | CE-10 | JOB-02 |

---

## 21. Changelog

| Version | Fecha | Cambios |
|---|---|---|
| 1.0 | 2026-09-03 | Draft inicial. Consolida brief, proto-persona, benchmark Tricount, stack del repo, y decisiones estrategicas de las sesiones de Discovery |
| 1.1 | 2026-09-03 | Agrega §15b (glosario tecnico para el equipo de diseno) y §15c (consideraciones de diseno mobile iOS + Android) |
| 1.2 | 2026-09-07 | Requisitos §11 traducidos al espanol; siglas explicadas en su primera aparicion (JWT, EARS, JTBD, MoSCoW, RICE, NFR, WCAG, JPA, PWA, FAB, HIG, CAGR, QA, UX, UI, CRUD, E2E); §13 optimizado con notas explicativas |
| 1.3 | 2026-09-08 | Decision de onboarding frictionless: REQ-SF-000 (nuevo — UUID anonimo auto-generado), REQ-SF-001/002 diferidos a v1, §9 MVP scope actualizado, §19 Decision Log con entrada 2026-09-08, §20 trazabilidad actualizada. Riesgo de perdida de datos por reinstalacion pendiente de documentar en §16. |
| 1.4 | 2026-09-08 | Sistema de aliases: REQ-SF-003 actualizado (aliases opcionales en creacion de grupo), REQ-SF-004 dividido en REQ-SF-004a (Modo A — reclamar alias pre-cargado) y REQ-SF-004b (Modo B — ingresar alias propio). §19 Decision Log actualizado. |

---

## 22. Enlaces

### Artefactos de Discovery

- [Brief del Reto — No Country](../00-discovery-research/brief-del-reto-no-country.md)
- [Brief Visual](../00-discovery-research/diagramas/brief-visual-splitflow.png) · [fuente Excalidraw](../00-discovery-research/diagramas/brief-visual-splitflow.excalidraw)
- [Benchmarking — Preguntas Clave](../00-discovery-research/diagramas/benchmarking-preguntas-clave.png) · [fuente Excalidraw](../00-discovery-research/diagramas/benchmarking-preguntas-clave.excalidraw)
- [Benchmark — Tricount](../00-discovery-research/benchmark-tricount.md)
- [Proto-Persona — Camila Rodriguez](../00-discovery-research/diagramas/proto-persona-splitflow.png) · [fuente Excalidraw](../00-discovery-research/diagramas/proto-persona-splitflow.excalidraw)

### Repositorio

- Repo: `S08-26-equipo-29` (GitHub, No Country)
- Arquitectura: `docs/ARCHITECTURE.md`
- API: `docs/API.md`

### Skill de referencia

- PRD framework: `prd-architect` (skill instalada)
