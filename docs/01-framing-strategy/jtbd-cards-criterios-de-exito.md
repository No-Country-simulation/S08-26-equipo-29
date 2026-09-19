---
kind: jtbd-cards
project: splitflow
version: 1.1
date: 2026-09-07
tags:
  - project/splitflow
  - type/jtbd
  - phase/framing
---

# JTBD Cards — Criterios de Exito SplitFlow

> Cada card mapea uno de los 10 criterios de exito del brief de No Country a su Job to be Done correspondiente, la User Story para el equipo, los datos que entran y salen del sistema, y los criterios de aceptación que QA usa para verificarlo.
>
> **Como leer las cards:** el *input* es lo que el usuario proporciona activamente; el *output* es lo que el sistema calcula o muestra en respuesta. Los criterios de aceptación en formato Gherkin (Given / When / Then) son directamente ejecutables en testing.
>
> **v1.1 — Bloques agregados:** User Story (accionable para el equipo), precondiciones (dependencias entre criterios), pantalla asociada (vinculo con diseño), prioridad MoSCoW (referencia al PRD §10), y escenarios de empty state donde faltaban.
>
> **Referencia:** PRD §5 (JTBD) · §10 (MoSCoW) · §11 (REQ-SF-XXX) · §12 (Gherkin) · [Brief del Reto - No Country](../00-discovery-research/brief-del-reto-no-country.md)
>
> **Glosario de nomenclatura:** ver sección final de este documento para la definición de todas las siglas y convenciones usadas (REQ-SF, JTBD, Gherkin, ExpenseSplit, Enum, etc.).

---

## Criterio 1 — Crear un grupo

**Descripcion:** El usuario crea un espacio digital compartido donde su grupo va a registrar gastos. Es el punto de entrada al producto — sin un grupo no hay nada que dividir. La pantalla inicial de la app define todo el modelo mental del usuario.

**Regla de negocio — Frictionless onboarding:** el usuario abre la app y puede crear un grupo de inmediato, sin registrar email ni contrasena. Al primer lanzamiento, el sistema genera automaticamente un User ID unico (UUID) que actua como identidad anonima del usuario. Ese ID se persiste localmente en el dispositivo y se convierte en la identidad operativa del MVP. La pantalla de perfil mostrara ese UUID como nombre de usuario provisional, incentivando al usuario a completar la autenticacion (email, notificaciones) en una fase futura — non-goal del MVP.

**JTBD mapeado:** JOB-01 — *Cuando comparto gastos en un viaje o salida grupal, quiero un lugar donde registrar quien pago que — para no perder nada en el chat de WhatsApp.*

**User Story:** Como usuario que abre la app por primera vez, quiero crear un grupo de inmediato sin registrarme — para empezar a registrar gastos sin friccion desde el primer momento.

**REQ relacionado:** REQ-SF-000 (nuevo — UUID auto-generado en primer lanzamiento) · REQ-SF-003 (crear grupo)
**Prioridad:** Must (PRD §10 — sin grupo no hay producto)
**Precondiciones:** App instalada y abierta. El UUID se genera automaticamente — no se requiere email ni contrasena.
**Pantalla asociada:** Splash / Home (lista de grupos) → Crear grupo (modal o pantalla nueva)

> **Impacto en PRD (pendiente sincronizar):** REQ-SF-001 (registro con email) y REQ-SF-002 (login con JWT) quedan diferidos a v1. El MVP reemplaza auth tradicional con UUID anonimo persistido localmente. Ver Decision Log del PRD — esta decision invalida la precondicion de auth en §9, §11 y §20.

---

### Input de datos

**Primer lanzamiento (UUID auto-generado)**

> Ninguno — el UUID se genera automaticamente sin input del usuario. No hay pantalla de registro ni formulario de inicio de sesion en el MVP.

**Crear grupo**

| Campo | Tipo | Obligatorio | Ejemplo | Validacion |
|---|---|---|---|---|
| Nombre del grupo | Texto libre | Si | "Viaje Melgar" | No vacio, max 60 caracteres |
| Moneda | Seleccion (lista) | No — default COP | COP / ARS / CLP / USD | Valor de lista fija |
| Nombres/aliases de participantes | Lista de texto libre (entrada incremental) | No — opcional | "Juan", "María", "Pedro" | Cada alias: no vacio, max 40 caracteres, sin duplicados dentro del grupo |

### Output del sistema

| Dato | Descripcion |
|---|---|
| User ID (UUID) generado y persistido | Identidad anonima del usuario, almacenada localmente en el dispositivo |
| Grupo creado con UUID propio | Identificador unico del grupo generado por el backend |
| Usuario creador como primer miembro | El creador queda automaticamente incluido con su UUID |
| Aliases pre-cargados (si se ingresaron) | Miembros placeholder en estado "sin reclamar" — visibles en la lista del grupo, sin UUID asignado todavia |
| Grupo visible en lista principal | Aparece en la pantalla de inicio del usuario |
| Estado inicial | 0 gastos · $0 saldo · 1+ miembro/s (creador activo + aliases sin reclamar si los hubiera) |

### Criterios de aceptacion

```gherkin
Feature: Crear un grupo de gastos (onboarding frictionless)

  Scenario: Primer lanzamiento — UUID generado sin registro
    Given el usuario abre la app por primera vez
    When la app termina de cargar
    Then el sistema genera automaticamente un User ID unico (UUID)
    And el UUID se persiste localmente en el dispositivo
    And el usuario ve directamente la pantalla de Home sin pantalla de login

  Scenario: Creacion exitosa con nombre valido
    Given el usuario esta en la app con su UUID generado
    When ingresa el nombre "Viaje Melgar" y toca "Crear grupo"
    Then el grupo "Viaje Melgar" aparece en su lista de grupos
    And el usuario es el primer miembro del grupo con su UUID
    And el grupo muestra 0 gastos y saldo $0

  Scenario: Intento sin nombre
    Given el usuario esta en la pantalla de crear grupo
    When deja el campo de nombre vacio y toca "Crear"
    Then el sistema muestra: "El nombre del grupo es obligatorio"
    And el grupo no se crea

  Scenario: Nombre con mas de 60 caracteres
    Given el usuario escribe un nombre de 61 caracteres
    When intenta guardarlo
    Then el campo no acepta el caracter 61 (limite de input)

  Scenario: Creador agrega aliases durante la creacion
    Given el usuario esta en la pantalla de crear grupo
    When agrega los aliases "Juan", "María" y "Pedro" antes de tocar "Crear grupo"
    Then el grupo se crea con el creador como miembro activo
    And "Juan", "María" y "Pedro" aparecen como miembros en estado "sin reclamar"
    And el creador puede compartir el enlace de invitacion para que cada uno reclame su alias

  Scenario: Creador no agrega aliases — grupo sin miembros pre-cargados
    Given el usuario esta en la pantalla de crear grupo sin agregar aliases
    When toca "Crear grupo" con solo el nombre
    Then el grupo se crea solo con el creador como miembro activo
    And la lista de miembros muestra solo al creador

  Scenario: Empty state — primer uso sin grupos
    Given el usuario abre la app por primera vez (UUID recien generado)
    When ve la pantalla principal (Home)
    Then ve un empty state con mensaje: "Todavia no tienes grupos"
    And un boton prominente: "Crear mi primer grupo"
```

---

## Criterio 2 — Invitar participantes

**Descripcion:** El creador comparte un enlace o QR del grupo y los participantes se unen a traves de ese recurso. El flujo tiene dos modos segun si el creador pre-cargó aliases o no durante la creacion del grupo (C1).

- **Modo A (aliases pre-cargados):** el creador ingreso los nombres/aliases de los participantes al crear el grupo. Al abrir el enlace, cada persona elige cual alias es el suyo de la lista disponible.
- **Modo B (sin aliases):** el creador no agrego nombres. Al abrir el enlace, el participante ingresa su propio nombre o alias.

En ambos modos, el alias queda asociado al UUID del dispositivo del participante y se refleja en todas las pantallas del flujo donde aparecen nombres.

**JTBD mapeado:** JOB-01 — *Cuando comparto gastos con amigos, quiero que todos puedan ver y registrar gastos en el mismo lugar — para que nadie quede afuera del calculo.*

**User Story (Modo A):** Como participante que recibe el enlace, quiero ver la lista de aliases creados por el organizador y seleccionar el mio — para quedar identificado correctamente sin tener que escribir nada.

**User Story (Modo B):** Como participante que recibe el enlace, quiero ingresar mi propio nombre o alias — para quedar identificado en el grupo con el nombre que prefiero.

**REQ relacionado:** REQ-SF-004a (Modo A) · REQ-SF-004b (Modo B)
**Prioridad:** Must (PRD §10)
**Precondiciones:** Grupo creado (C1). No se requiere autenticacion con email — basta con el UUID del dispositivo.
**Pantallas asociadas:**
- Creador: Detalle de grupo → Compartir enlace / QR
- Participante Modo A: Pantalla de union → Seleccionar alias de la lista
- Participante Modo B: Pantalla de union → Ingresar nombre o alias propio

---

### Input de datos

**Creador — Compartir recurso de invitacion**

| Campo | Tipo | Obligatorio | Descripcion |
|---|---|---|---|
| Enlace / QR de invitacion | Generado por sistema | No (accion del creador) | El sistema lo genera automaticamente — el creador decide cuando compartirlo |

**Participante Modo A — Aliases pre-cargados por el creador**

| Campo | Tipo | Obligatorio | Ejemplo | Validacion |
|---|---|---|---|---|
| Alias seleccionado | Seleccion de lista (aliases en estado "sin reclamar") | Si | "María" de la lista [Juan, María, Pedro] | Solo aliases disponibles; cada uno puede reclamarse una sola vez |

**Participante Modo B — Sin aliases pre-cargados**

| Campo | Tipo | Obligatorio | Ejemplo | Validacion |
|---|---|---|---|---|
| Nombre o alias propio | Texto libre | Si | "Carlos" | No vacio, max 40 caracteres, no puede existir ya en el grupo |

### Output del sistema

| Dato | Descripcion |
|---|---|
| Alias reclamado y vinculado al UUID del dispositivo | El participante queda identificado con su nombre/alias |
| Estado del alias actualizado | Modo A: pasa de "sin reclamar" a activo · Modo B: nuevo miembro creado con el alias ingresado |
| Lista de miembros actualizada | Todos los integrantes ven el alias nuevo o reclamado en tiempo real |
| Nombre/alias propagado a todas las pantallas | Aparece correctamente en lista de gastos, saldos, desglose trazable y pares de deuda |

### Criterios de aceptacion

```gherkin
Feature: Unirse a un grupo como participante

  Scenario: Modo A — Participante reclama su alias de la lista pre-cargada
    Given el grupo "Viaje Melgar" tiene los aliases sin reclamar: "Juan", "María", "Pedro"
    When María abre el enlace de invitacion del grupo
    Then ve la pantalla "¿Cuál de estos eres tú?" con la lista disponible
    When selecciona "María"
    Then el alias "María" queda asociado a su UUID
    And aparece como miembro activo en la lista del grupo para todos los integrantes
    And el alias "María" ya no esta disponible para que otro lo reclame

  Scenario: Modo A — Alias ya reclamado por otro dispositivo
    Given el alias "María" ya fue reclamado
    When un segundo dispositivo abre el enlace y ve la lista
    Then el alias "María" no aparece en las opciones disponibles
    And solo se muestran los aliases aun sin reclamar

  Scenario: Modo B — Participante ingresa su propio nombre
    Given el grupo "Asado" no tiene aliases pre-cargados
    When Carlos abre el enlace de invitacion
    Then ve la pantalla "¿Con que nombre quieres aparecer en el grupo?"
    When ingresa "Carlos" y confirma
    Then "Carlos" queda agregado como miembro activo con su UUID
    And aparece en la lista de miembros para todos los integrantes

  Scenario: Modo B — Nombre ya existente en el grupo
    Given el grupo ya tiene un miembro llamado "Carlos"
    When otro participante ingresa "Carlos" al unirse
    Then el sistema muestra: "Ya hay alguien con ese nombre en el grupo. Elige otro."
    And el participante puede ingresar un nombre diferente

  Scenario: Nombre vacio al intentar unirse (Modo B)
    Given el participante esta en la pantalla de ingreso de nombre
    When deja el campo vacio y toca "Unirme"
    Then el sistema muestra: "Debes ingresar un nombre para unirte"
    And no se crea el miembro

  Scenario: Limite de participantes alcanzado (50)
    Given el grupo ya tiene 50 miembros (activos + aliases sin reclamar)
    When un nuevo participante intenta abrirse el enlace de invitacion
    Then el sistema muestra: "Este grupo ya alcanzo el limite de 50 participantes"
    And el participante no puede unirse
```

---

## Criterio 3 — Registrar un gasto

**Descripcion:** El usuario registra un nuevo gasto realizado durante la actividad grupal. Es el momento mas critico del flujo — aqui se captura quien pago, cuanto fue y que se compro. Si este formulario es confuso, todo lo demas falla.

**JTBD mapeado:** JOB-01 — *Cuando alguien del grupo paga por todos, quiero registrarlo rapido y correctamente — para que quede documentado sin depender de mi memoria ni del chat.*

**User Story:** Como miembro de un grupo, quiero registrar un gasto indicando descripcion, monto y pagador — para que quede documentado quién pagó y cuánto.

**REQ relacionado:** REQ-SF-006
**Prioridad:** Must (PRD §10 — corazon del JTBD, criterios 3-5)
**Precondiciones:** Grupo creado (C1) + al menos 1 participante adicional (C2).
**Pantalla asociada:** Detalle de grupo → Formulario de gasto (pantalla nueva, stack navigation)

---

### Input de datos

| Campo | Tipo | Obligatorio | Ejemplo | Validacion |
|---|---|---|---|---|
| Descripcion del gasto | Texto libre | Si | "Alojamiento Hotel Melgar" | No vacio, max 80 caracteres |
| Monto total | Decimal positivo | Si | $120.000 | Mayor a $0, 2 decimales |
| Quien pago | Seleccion (miembro del grupo) | Si | "Camila" | Debe ser miembro del grupo |
| Fecha | Fecha | No — default hoy | 2026-09-07 | No puede ser futura |

### Output del sistema

| Dato | Descripcion |
|---|---|
| Gasto en la lista del grupo | Descripcion, monto, pagador y fecha visibles |
| Saldos del grupo actualizados | El calculo se recalcula automaticamente |
| ExpenseSplit creado | Registro por participante con su monto individual |

### Criterios de aceptacion

```gherkin
Feature: Registrar un gasto en el grupo

  Scenario: Registro exitoso con campos minimos
    Given el usuario esta dentro de un grupo con participantes
    When registra "Alojamiento" por $120.000 pagado por "Camila"
    Then el gasto aparece en la lista del grupo con descripcion, monto, pagador y fecha
    And los saldos del grupo se recalculan automaticamente

  Scenario: Monto invalido — cero o vacio
    Given el usuario esta en el formulario de nuevo gasto
    When ingresa monto $0 o lo deja vacio y toca "Guardar"
    Then el sistema muestra: "El monto debe ser mayor a $0"
    And el gasto no se registra

  Scenario: Descripcion vacia
    Given el usuario no ingresa descripcion en el gasto
    When toca "Guardar"
    Then el sistema muestra: "La descripcion es obligatoria"

  Scenario: Empty state — grupo sin gastos
    Given el grupo tiene participantes pero ningun gasto registrado
    When el usuario abre la lista de gastos del grupo
    Then ve un empty state: "Este grupo todavia no tiene gastos"
    And un boton: "Registrar el primer gasto"
```

---

## Criterio 4 — Seleccionar quienes participan

**Descripcion:** Al registrar un gasto, el usuario indica cuales miembros del grupo participaron en ese gasto especifico. No siempre todos consumen lo mismo ni todos estan en todos los gastos — esta distincion es clave para el calculo correcto.

**JTBD mapeado:** JOB-01 — *Cuando registro un gasto que no fue para todos, quiero indicar exactamente quienes participaron — para que el calculo refleje la realidad y no haya discusiones despues.*

**User Story:** Como miembro que registra un gasto, quiero seleccionar cuales integrantes participaron — para que solo se cobre a quienes les corresponde.

**REQ relacionado:** REQ-SF-006 (extension de participantes)
**Prioridad:** Must (PRD §10 — parte del flujo critico de registro)
**Precondiciones:** Flujo de registro de gasto iniciado (C3) + grupo con 2+ miembros.
**Pantalla asociada:** Formulario de gasto → Seccion de seleccion de participantes (dentro del mismo formulario)

---

### Input de datos

| Campo | Tipo | Obligatorio | Ejemplo | Validacion |
|---|---|---|---|---|
| Participantes del gasto | Seleccion multiple (miembros del grupo) | Si | [Camila, María, Juan] | Minimo 1 participante |

> El pagador puede o no estar en la lista de participantes. Ejemplo: Camila paga el postre de María y Juan, pero ella no comio postre — Camila no es participante del gasto que ella misma pago.

### Output del sistema

| Dato | Descripcion |
|---|---|
| Gasto vinculado solo a participantes seleccionados | Los no seleccionados no tienen deuda por ese gasto |
| Division calculada entre seleccionados | Solo los seleccionados aparecen en el ExpenseSplit |

### Criterios de aceptacion

```gherkin
Feature: Seleccionar participantes de un gasto

  Scenario: Gasto solo para algunos miembros
    Given un grupo de 5 miembros con un gasto de $60.000
    When el usuario selecciona 3 participantes para ese gasto
    Then el gasto se divide unicamente entre esos 3 miembros
    And los 2 miembros no seleccionados no tienen deuda por ese gasto

  Scenario: Pagador no incluido como participante
    Given Camila paga $45.000 por el postre de María y Juan (ella no consumio)
    When registra el gasto con Camila como pagadora y solo María y Juan como participantes
    Then María y Juan deben $22.500 cada uno a Camila
    And Camila no tiene deuda por ese gasto (pago por otros)

  Scenario: Intento sin seleccionar participantes
    Given el usuario esta en el formulario con monto y descripcion completos
    When no selecciona ningun participante y toca "Guardar"
    Then el sistema muestra: "Debes seleccionar al menos un participante"

  Scenario: Default — todos seleccionados
    Given el usuario abre el formulario de gasto en un grupo de 4 miembros
    When llega a la seccion de participantes
    Then todos los miembros aparecen seleccionados por defecto
    And el usuario puede deseleccionar a quienes no participaron
```

---

## Criterio 5 — Definir como dividirlo

**Descripcion:** El usuario elige el metodo de division del gasto entre los participantes seleccionados. Es el punto de mayor complejidad cognitiva del flujo — SplitFlow debe hacerlo simple, validado y con feedback en tiempo real.

**JTBD mapeado:** JOB-01 — *Cuando la cena no fue igual para todos, quiero poder asignar cuanto le corresponde a cada uno — para que la division sea justa y nadie sienta que pago de mas.*

**User Story:** Como miembro que registra un gasto, quiero elegir si dividir en partes iguales o por monto especifico — para que la distribucion refleje lo que cada persona consumio.

**REQ relacionado:** REQ-SF-007 · REQ-SF-008 · REQ-SF-009
**Prioridad:** Must (partes iguales) / Should (por monto especifico) — PRD §10
**Precondiciones:** Participantes seleccionados (C4) + monto total ingresado (C3).
**Pantalla asociada:** Formulario de gasto → Seccion de metodo de division (dentro del mismo formulario, debajo de participantes)

---

### Input de datos

**Modo A — Partes iguales (EQUAL)**

| Campo | Tipo | Obligatorio | Ejemplo |
|---|---|---|---|
| Metodo | Seleccion | Si | "Partes iguales" |
| (Sin input adicional — el sistema calcula automaticamente) | — | — | — |

**Modo B — Por monto especifico (BY_AMOUNT)**

| Campo | Tipo | Obligatorio | Ejemplo | Validacion |
|---|---|---|---|---|
| Metodo | Seleccion | Si | "Por monto" | — |
| Monto por participante | Decimal positivo x N participantes | Si | Camila: $20k · María: $15k · Juan: $25k | Suma de todos = monto total del gasto |

### Output del sistema

| Dato | Descripcion |
|---|---|
| ExpenseSplit por participante | Un registro por cada participante con su monto asignado |
| Indicador inline en tiempo real | "X sin asignar" mientras la suma no cuadre (modo BY_AMOUNT) |
| Validacion de suma | El boton "Guardar" se deshabilita si la suma no iguala el total |

### Criterios de aceptacion

```gherkin
Feature: Definir metodo de division de un gasto

  Scenario: Division en partes iguales
    Given un gasto de $100.000 con 4 participantes seleccionados
    When el usuario elige "Partes iguales"
    Then el sistema asigna $25.000 a cada participante automaticamente
    And el boton "Guardar" se habilita sin accion adicional

  Scenario: Division por monto — montos que cuadran
    Given un gasto de $60.000 con 3 participantes en modo "Por monto"
    When el usuario asigna $20.000 a A, $15.000 a B y $25.000 a C
    Then el indicador muestra "$0 sin asignar"
    And el boton "Guardar" se habilita

  Scenario: Division por monto — montos que no cuadran
    Given un gasto de $60.000 con 3 participantes en modo "Por monto"
    When el usuario asigna $20.000 a A y $15.000 a B (C sin asignar)
    Then el sistema muestra "$25.000 sin asignar" en tiempo real
    And el boton "Guardar" permanece deshabilitado

  Scenario: Redondeo en division igualitaria
    Given un gasto de $100 entre 3 participantes
    When el usuario elige "Partes iguales"
    Then el sistema asigna $33,34 al primer participante y $33,33 a los otros dos
    And la suma total es exactamente $100 (tolerancia de 1 centavo, NFR-05)
```

---

## Criterio 6 — Consultar cuanto corresponde a cada persona

**Descripcion:** El usuario puede ver de un vistazo el saldo neto de cada miembro del grupo — cuanto debe o cuanto le deben — sin necesidad de calcular nada manualmente. Esta vista responde la pregunta "cuanto puse yo vs. cuanto me correspondia".

**JTBD mapeado:** JOB-01 — *Cuando termina una salida, quiero saber cuanto debo o cuanto me deben en total — para no tener que sumar nada en mi cabeza.*

**User Story:** Como miembro del grupo, quiero ver el saldo neto de cada integrante — para saber de un vistazo quién debe y quién tiene saldo a favor.

**REQ relacionado:** REQ-SF-010
**Prioridad:** Must (PRD §10 — core del diferenciador, criterios 6-8)
**Precondiciones:** Al menos 1 gasto registrado en el grupo (C3 + C4 + C5 completados).
**Pantalla asociada:** Detalle de grupo → Vista de saldos (tab o seccion dentro del detalle)

---

### Input de datos

> Ninguno — el saldo neto es un calculo automatico del sistema a partir de los ExpenseSplits registrados. El usuario no ingresa datos; el sistema los deriva.

### Output del sistema

| Dato | Tipo | Ejemplo |
|---|---|---|
| Nombre del miembro | Texto | "Camila" |
| Saldo neto | Decimal con signo | -$43.000 (debe) · +$25.000 (le deben) |
| Indicador visual de direccion | Label o color | "Debes" / "Te deben" |
| Vista actualizada en tiempo real | Al agregar un nuevo gasto, los saldos se recalculan |

> **Propiedad de conservacion:** la suma de todos los saldos netos del grupo siempre es $0. Si Camila debe $43.000, ese dinero esta distribuido como saldo positivo entre los otros miembros.

### Criterios de aceptacion

```gherkin
Feature: Ver saldos netos del grupo

  Scenario: Vista de saldos con gastos registrados
    Given un grupo con 3 gastos registrados y 4 participantes
    When el usuario abre la pantalla de saldos del grupo
    Then ve el saldo neto de cada miembro con su nombre
    And los saldos negativos tienen indicador visual "Debes"
    And los saldos positivos tienen indicador visual "Te deben"

  Scenario: Propiedad de conservacion
    Given cualquier grupo con gastos registrados
    When el sistema calcula los saldos
    Then la suma de todos los saldos es $0

  Scenario: Saldo actualizado al agregar un gasto
    Given el usuario registra un nuevo gasto en el grupo
    When vuelve a la pantalla de saldos
    Then los saldos reflejan el nuevo gasto automaticamente

  Scenario: Empty state — grupo sin gastos registrados
    Given un grupo con participantes pero sin ningun gasto
    When el usuario abre la pantalla de saldos
    Then ve un empty state: "Todavia no hay saldos — registra el primer gasto para ver cuanto corresponde a cada persona"
```

---

## Criterio 7 — Visualizar sus deudas

**Descripcion:** El usuario puede ver sus deudas con direccion explicita — quien le debe a quien — no solo el saldo neto abstracto. "Juan debe $25.000 a Maria" es accionable; "Juan: -$25.000" no lo es.

**JTBD mapeado:** JOB-01 — *Cuando tengo que cobrarle a alguien, quiero ver exactamente a quien tengo que hablarle y por cuanto — para no tener que hacer la cuenta ni pasar verguenza preguntando.*

**User Story:** Como miembro del grupo, quiero ver la lista de deudas con direccion (quién debe a quién) — para saber con quién tengo que resolver cada pago.

**REQ relacionado:** REQ-SF-012
**Prioridad:** Must (PRD §10 — parte del diferenciador de saldos)
**Precondiciones:** Al menos 1 gasto registrado que genere deuda (C3-C5 completados) + saldos calculados (C6).
**Pantalla asociada:** Vista de saldos → Lista de deudas direccionales (sub-seccion o drill-down desde el saldo)

---

### Input de datos

> Ninguno — los pares de deuda se calculan a partir de los saldos netos. El usuario solo navega hacia la vista de deudas.

### Output del sistema

| Dato | Tipo | Ejemplo |
|---|---|---|
| Deudor | Miembro del grupo | "Juan" |
| Acreedor | Miembro del grupo | "María" |
| Monto | Decimal positivo | $25.000 |
| Estado | Enum | PENDING · SETTLED |
| Vista personal | Solo mis deudas (deudo / me deben) | "Debes $25.000 a María" |

### Criterios de aceptacion

```gherkin
Feature: Visualizar deudas con direccion

  Scenario: Vista de mis deudas pendientes
    Given Juan tiene un saldo de -$25.000 y María tiene +$25.000 en el grupo
    When Juan abre la pantalla de sus deudas
    Then ve: "Debes $25.000 a María"
    And puede acceder al boton para marcar esa deuda como pagada

  Scenario: Vista de lo que me deben
    Given María tiene un saldo de +$25.000 en el mismo grupo
    When María abre la pantalla de deudas
    Then ve: "Juan te debe $25.000"
    And puede ver el estado de esa deuda (Pendiente / Saldada)

  Scenario: Usuario sin deudas pendientes
    Given el usuario ya saldo todas sus deudas en el grupo
    When abre la pantalla de deudas
    Then ve un estado vacio: "No tienes deudas pendientes en este grupo"
```

---

## Criterio 8 — Comprender de donde surge cada importe

**Descripcion:** El usuario puede expandir su saldo personal para ver el desglose especifico de gastos que lo generaron, con el monto que le corresponde a el por cada gasto. Este es el **diferenciador central de SplitFlow** — Tricount no resuelve esto.

**JTBD mapeado:** JOB-01 + JOB-02 — *Cuando veo que debo $43.000, quiero saber exactamente de que gastos vienen esos $43.000 — para poder verificarlo, entenderlo y no tener que fiarme de un numero que no puedo rastrear.*

**User Story:** Como miembro del grupo, quiero expandir mi saldo para ver de que gastos se compone — para verificar que el calculo es correcto y entender por que debo esa cantidad.

**REQ relacionado:** REQ-SF-011 · Endpoint nuevo: `GET /api/groups/{id}/balances/{userId}/breakdown`
**Prioridad:** Must (PRD §10 — diferenciador central, RICE score 12.0)
**Precondiciones:** Saldos visibles (C6) + al menos 1 gasto que aplique al usuario logueado.
**Pantalla asociada:** Vista de saldos → Desglose trazable (drill-down al tocar el saldo propio)

---

### Input de datos

| Accion | Tipo | Descripcion |
|---|---|---|
| Tap en el saldo propio | Gesto de usuario | El usuario toca su saldo para abrir el desglose |

### Output del sistema

| Dato | Tipo | Ejemplo |
|---|---|---|
| Lista de gastos que originaron el saldo | Lista ordenada por fecha | Alojamiento · Supermercado · Transporte |
| Monto individual del usuario por gasto | Decimal | $25.000 · $10.000 · $8.000 |
| Descripcion del gasto | Texto | "Alojamiento Hotel Melgar" |
| Fecha del gasto | Fecha | 2026-09-05 |
| Total verificado | Suma automatica | $43.000 (igual al saldo mostrado en pantalla anterior) |

### Criterios de aceptacion

```gherkin
Feature: Ver desglose trazable del saldo

  Scenario: Desglose con multiples gastos
    Given Camila tiene un saldo de -$43.000 en el grupo "Viaje Melgar"
    When Camila toca su saldo
    Then ve el desglose:
      | Gasto        | Mi parte |
      | Alojamiento  | $25.000  |
      | Supermercado | $10.000  |
      | Transporte   | $8.000   |
    And la suma de la columna "Mi parte" es exactamente $43.000
    And cada item muestra la descripcion y la fecha del gasto

  Scenario: Consistencia entre saldo y desglose
    Given el usuario ve su saldo de -$43.000 en la pantalla de grupo
    When toca el saldo y ve el desglose
    Then la suma del desglose es siempre igual al saldo mostrado en pantalla anterior

  Scenario: Gasto del que el usuario no fue participante
    Given un gasto en el grupo en el que Camila no participo
    When Camila ve su desglose
    Then ese gasto no aparece en su desglose (solo los que le aplican)

  Scenario: Empty state — usuario sin gastos que le apliquen
    Given el usuario es miembro del grupo pero no participo en ningun gasto
    When toca su saldo ($0)
    Then ve un empty state: "No participaste en ningun gasto de este grupo todavia"
```

---

## Criterio 9 — Registrar un pago

**Descripcion:** El usuario puede marcar una deuda como pagada, sin necesidad de integracion bancaria real. Es un registro manual de que el intercambio de dinero ocurrio fuera de la app (efectivo, transferencia, Nequi, etc.).

**JTBD mapeado:** JOB-02 — *Cuando alguien me pago o yo le pague a alguien, quiero dejarlo registrado en la app — para que el grupo sepa que esa cuenta quedo cerrada sin tener que anunciarlo por WhatsApp.*

**User Story:** Como deudor o acreedor, quiero marcar una deuda como pagada — para que el grupo vea que esa cuenta está resuelta sin tener que anunciarlo fuera de la app.

**REQ relacionado:** REQ-SF-013
**Prioridad:** Must (PRD §10 — cierre del flujo completo)
**Precondiciones:** Deuda visible con estado PENDING (C7) + usuario es deudor o acreedor en esa deuda.
**Pantalla asociada:** Lista de deudas → Accion "Marcar como pagado" (boton en cada item de deuda + dialogo de confirmacion)

---

### Input de datos

| Campo | Tipo | Obligatorio | Descripcion |
|---|---|---|---|
| Deuda a saldar | Contextual (par deudor-acreedor visible en pantalla) | Si | La deuda especifica que el usuario marca como pagada |
| Confirmacion | Tap en "Marcar como pagado" + confirmacion de dialogo | Si | Accion irreversible — requiere confirmacion explicita |

### Output del sistema

| Dato | Cambio | Ejemplo |
|---|---|---|
| Estado de la deuda | PENDING → SETTLED | Deuda Juan → María: saldada |
| Saldo del deudor | Actualizado a $0 para esa deuda | Juan: $0 con María |
| Saldo del acreedor | Actualizado a $0 para esa deuda | María: $0 con Juan |
| Historial del grupo | La deuda aparece como "Saldada" | Con timestamp de cuando se marco |

### Criterios de aceptacion

```gherkin
Feature: Marcar una deuda como pagada

  Scenario: Cierre exitoso de una deuda
    Given Juan debe $25.000 a María en el grupo "Viaje Melgar"
    When Juan toca "Marcar como pagado" y confirma en el dialogo
    Then el saldo de Juan con María se actualiza a $0
    And la deuda aparece como "Saldada" en el historial
    And María ve el cambio de estado en su vista del grupo

  Scenario: Confirmacion obligatoria antes de saldar
    Given Juan ve la deuda pendiente con María
    When Juan toca "Marcar como pagado"
    Then el sistema muestra un dialogo de confirmacion: "Confirmas que ya pagaste $25.000 a María?"
    And la deuda no se salda hasta que Juan confirme

  Scenario: Intento de saldar una deuda ya saldada
    Given la deuda Juan → María ya esta en estado SETTLED
    When Juan intenta marcarla como pagada nuevamente
    Then la accion no esta disponible (el boton no aparece o esta deshabilitado)
```

---

## Criterio 10 — Identificar cuando todas las cuentas estan saldadas

**Descripcion:** El usuario puede saber de un vistazo si el grupo ya no tiene deudas pendientes — cerrando el ciclo completo del viaje o actividad compartida. Es el momento de cierre emocional del producto.

**JTBD mapeado:** JOB-02 — *Cuando termina el viaje y todos pagaron, quiero que la app me confirme que estamos a mano — para poder cerrar el capitulo sin dudas ni cuentas pendientes en mi cabeza.*

**User Story:** Como miembro del grupo, quiero ver un indicador claro cuando ya no quedan deudas pendientes — para saber que el tema está cerrado y seguir adelante.

**REQ relacionado:** REQ-SF-014
**Prioridad:** Must (PRD §10 — cierre emocional del flujo)
**Precondiciones:** Al menos 1 deuda existio en el grupo + todas las deudas pasaron a SETTLED (C9 ejecutado para cada deuda).
**Pantalla asociada:** Vista de saldos → Estado de cierre total (banner o indicador visual prominente)

---

### Input de datos

> Ninguno — el estado de cierre total es un calculo automatico del sistema. El usuario llega a este estado cuando todas las deudas del grupo pasan a SETTLED.

### Output del sistema

| Dato | Tipo | Ejemplo |
|---|---|---|
| Indicador visual de cierre total | Banner o estado prominente | "Todas las cuentas estan saldadas" |
| Deudas pendientes | Contador | 0 |
| Estado de cada deuda | Enum | Todas en SETTLED |
| Diferenciacion con estado parcial | Visual | El indicador de cierre NO aparece si hay al menos 1 PENDING |

### Criterios de aceptacion

```gherkin
Feature: Identificar cierre total de cuentas del grupo

  Scenario: Todas las deudas saldadas
    Given un grupo con 4 deudas, todas en estado SETTLED
    When cualquier miembro abre la pantalla de saldos del grupo
    Then ve un indicador visual de cierre: "Todas las cuentas estan saldadas"
    And no hay ninguna deuda con estado PENDING visible en la pantalla

  Scenario: Estado parcial — queda al menos una deuda pendiente
    Given un grupo con 3 deudas: 2 SETTLED y 1 PENDING
    When cualquier miembro abre la pantalla de saldos
    Then el indicador de cierre total NO aparece
    And la deuda pendiente sigue visible con su estado PENDING y el monto correspondiente

  Scenario: Transicion de estado parcial a cierre total
    Given el grupo tiene 1 deuda en estado PENDING
    When el deudor la marca como pagada y confirma
    Then el grupo pasa a estado de cierre total
    And el indicador "Todas las cuentas estan saldadas" aparece para todos los miembros
```

---

## Resumen de trazabilidad

| Criterio | JTBD | REQ-SF | User Story (resumen) | Prioridad | Pantalla | Input principal | Output principal |
|---|---|---|---|---|---|---|---|
| 1. Crear grupo | JOB-01 | 003 | Crear espacio para el grupo | Must | Home → Crear grupo | Nombre del grupo | Grupo creado, usuario como miembro |
| 2. Invitar participantes | JOB-01 | 004 | Agregar integrantes | Must | Detalle grupo → Agregar miembro | Nombre / enlace | Miembro agregado al grupo |
| 3. Registrar gasto | JOB-01 | 006 | Documentar quién pagó | Must | Detalle grupo → Formulario gasto | Descripcion, monto, pagador | Gasto en lista, saldos actualizados |
| 4. Seleccionar quienes participan | JOB-01 | 006 | Indicar quiénes consumieron | Must | Formulario gasto → Participantes | Seleccion de participantes | ExpenseSplit solo entre seleccionados |
| 5. Definir como dividirlo | JOB-01 | 007-009 | Elegir método de división | Must/Should | Formulario gasto → Método | Metodo + montos individuales | ExpenseSplit validado, feedback inline |
| 6. Consultar cuanto a cada persona | JOB-01 | 010 | Ver saldo neto | Must | Detalle grupo → Saldos | (Lectura) | Saldo neto por miembro |
| 7. Visualizar sus deudas | JOB-01 | 012 | Ver quién debe a quién | Must | Saldos → Deudas | (Lectura) | Pares de deuda con direccion |
| 8. Comprender de donde surge el importe | JOB-01 + 02 | 011 | Verificar desglose | Must | Saldos → Desglose trazable | Tap en el saldo | Desglose trazable por gasto |
| 9. Registrar un pago | JOB-02 | 013 | Marcar deuda como pagada | Must | Deudas → Marcar pagado | Confirmacion de pago | Deuda PENDING → SETTLED |
| 10. Todas las cuentas saldadas | JOB-02 | 014 | Confirmar cierre total | Must | Saldos → Indicador cierre | (Lectura) | Indicador visual de cierre total |

---

## Cadena de dependencias entre criterios

```
C1 Crear grupo
 └─ C2 Invitar participantes
     └─ C3 Registrar gasto
         ├─ C4 Seleccionar participantes
         │   └─ C5 Definir division
         │       └─ C6 Ver saldos netos
         │           ├─ C7 Ver deudas direccionales
         │           │   └─ C9 Marcar como pagado
         │           │       └─ C10 Cierre total
         │           └─ C8 Desglose trazable (DIFERENCIADOR)
         └──────────────────────────────────────────────────
```

> **Lectura:** cada criterio requiere que todos los que están encima de el en el arbol se hayan completado. C3-C5 son un flujo unico (formulario de gasto); C6-C8 son vistas derivadas; C9-C10 son acciones de cierre.

---

## Glosario de nomenclatura

> Esta seccion define todas las siglas, convenciones de nombre y terminos tecnicos usados en este documento. Si un termino no se autoexplica, esta aqui.

### Siglas del proyecto SplitFlow

| Sigla | Significado | Donde se usa |
|---|---|---|
| **REQ-SF-XXX** | Requisito funcional de SplitFlow, numerado secuencialmente. REQ = Requirement (requisito), SF = SplitFlow, XXX = numero correlativo (001-014). Cada uno tiene su definicion completa en el PRD §11. | Todas las cards (campo "REQ relacionado") |
| **JOB-01 / JOB-02** | Identificadores de los dos Jobs To Be Done definidos para SplitFlow. JOB-01 es el primario (registrar y dividir gastos); JOB-02 es el secundario (cerrar deudas y confirmar saldos). Definidos en el PRD §5. | Todas las cards (campo "JTBD mapeado") |
| **CE-N** | Criterio de Exito numero N, segun la lista de 10 criterios del brief de No Country. Cada card de este documento corresponde a un CE. | Tabla de trazabilidad del PRD §20 |
| **PP-N** | Pain Point numero N, los 7 problemas identificados en el brief. Definidos en el PRD §4. | PRD §4, trazabilidad §20 |
| **NFR-XX** | Non-Functional Requirement (Requisito No Funcional) — describe como se comporta el sistema (rendimiento, seguridad, accesibilidad), no que hace. Definidos en el PRD §13. | C5 (NFR-05 redondeo) |
| **NG-N** | Non-Goal numero N — lo que SplitFlow decide conscientemente NO hacer en esta version. Definidos en el PRD §8. | PRD §8 |
| **NI-N** | Incognita (Need to Investigate) numero N — decision pendiente que bloquea o afecta scope. Definidas en el PRD §18. | PRD §18 |
| **IM-N** | Input Metric numero N — metrica operativa que alimenta la North Star. Definidas en el PRD §7. | PRD §7 |
| **R-N** | Riesgo numero N, con probabilidad, impacto y mitigacion. Definidos en el PRD §16. | PRD §16 |

### Frameworks y convenciones

| Termino | Que es | Por que importa aqui |
|---|---|---|
| **JTBD (Jobs To Be Done)** | Framework que describe para que "contrata" el usuario un producto. No describe al usuario ni la funcionalidad — describe la tarea real que quiere resolver. Formato: "Cuando \<situacion\>, quiero \<motivacion\> — para \<resultado\>." | Cada card tiene un JTBD mapeado. Es el ancla: si una feature no resuelve un Job, no deberia existir. |
| **User Story** | Descripcion de una funcionalidad desde la perspectiva del equipo de desarrollo, con formato: "Como \<rol\>, quiero \<accion\> — para \<beneficio\>." A diferencia del JTBD (que describe por que el usuario necesita algo), la User Story describe que tiene que construir el equipo. | Agregada en v1.1. Es el puente entre el JTBD (motivacion del usuario) y el REQ-SF (especificacion tecnica). El dev lee la User Story; el disenador lee el JTBD. |
| **Gherkin** | Lenguaje de especificacion de comportamiento que usa tres palabras clave: **Given** (estado inicial), **When** (accion del usuario), **Then** (resultado esperado). Cada escenario es un test ejecutable — QA lo toma directamente para verificar el requisito. | Todas las cards tienen criterios de aceptacion en Gherkin. Son el contrato entre diseno y QA: si el escenario pasa, el criterio se cumple. |
| **MoSCoW** | Framework de priorizacion: **Must** (debe tener — sin esto no existe el producto), **Should** (deberia — importante pero no bloqueante), **Could** (podria — deseable si hay tiempo), **Won't** (no en esta version). | Cada card referencia su prioridad MoSCoW del PRD §10. |
| **RICE** | Modelo cuantitativo: (Reach x Impact x Confidence) / Effort = Score. Mayor score = mayor prioridad. | PRD §10 — usado para ordenar features dentro de los Must. |
| **EARS** | Easy Approach to Requirements Syntax — formato de requisitos: "Cuando \<disparador\>, el sistema debe \<respuesta\>." Los REQ-SF-XXX siguen este formato en el PRD §11. | Los REQ de cada card estan escritos en EARS. |
| **Empty state** | El estado de una pantalla cuando no hay datos para mostrar. Ejemplo: la lista de grupos cuando el usuario acaba de registrarse. Es un caso de diseno que se omite frecuentemente y genera confusion si no se diseña. | Escenarios de Gherkin en C1, C3, C6 y C8 cubren empty states. |

### Terminos del modelo de datos

| Termino                  | Que es                                                                                                                                                                                                                                             | Donde vive                                                        |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **ExpenseSplit**         | Registro individual que conecta un gasto (Expense) con un participante y su monto asignado. Si un gasto de $60.000 se divide entre 3 personas, se crean 3 ExpenseSplits ($20k cada uno). Es la entidad que hace posible el desglose trazable (C8). | Tabla `ExpenseSplit` en la base de datos. Definida en el PRD §14. |
| **Enum**                 | Lista cerrada de valores posibles para un campo. Solo existen los valores definidos — no hay un "quinto estado".                                                                                                                                   | Modelo de datos del PRD §14                                       |
| **EQUAL / BY_AMOUNT**    | Los dos modos de division de gastos en el MVP. EQUAL = partes iguales (el sistema calcula); BY_AMOUNT = monto especifico por persona (el usuario asigna manualmente). Son valores del Enum `split_method` en la tabla Expense.                     | C5, PRD §14                                                       |
| **PENDING / SETTLED**    | Los dos estados de una deuda. PENDING = deuda activa, no pagada; SETTLED = deuda cerrada, marcada como pagada. Son valores del Enum `Payment.status`.                                                                                              | C7, C9, C10, PRD §14                                              |
| **UUID**                 | Universally Unique Identifier — identificador unico con formato `550e8400-e29b-41d4-a716-446655440000`. Cada grupo, gasto, usuario y pago tiene el suyo. No es legible para humanos — es un ID tecnico.                                            | C1 (output: grupo creado con UUID), PRD §14                       |
| **JWT (JSON Web Token)** | Credencial cifrada de sesion. El backend la emite al hacer login; el frontend la incluye en cada peticion para demostrar que el usuario esta autenticado. Expira despues de un tiempo configurado.                                                 | PRD §11 (REQ-SF-001/002), §15b                                    |

---

## Changelog

| Version | Fecha | Cambios |
|---|---|---|
| 1.0 | 2026-09-07 | Documento inicial. Los 10 criterios de exito del brief mapeados a JTBD, inputs/outputs y criterios de aceptacion en Gherkin |
| 1.1 | 2026-09-07 | Auditoria y mejora: +User Story por card, +precondiciones y cadena de dependencias, +pantalla asociada, +prioridad MoSCoW, +empty states faltantes (C1, C3, C6, C8), +escenario default en C4, +tabla de trazabilidad ampliada (7 → 10 columnas), +glosario de nomenclatura con ~25 terminos |
| 1.2 | 2026-09-08 | Decision de onboarding frictionless: C1 actualizado con Regla de negocio, REQ-SF-000 (nuevo), precondicion cambiada de "usuario autenticado" a "UUID auto-generado", User Story reformulada, Input/Output y escenarios Gherkin actualizados (nuevo scenario UUID en primer lanzamiento). C2 precondicion corregida (elimina referencia a autenticacion). Sincronizado con PRD v1.3. |
| 1.3 | 2026-09-08 | Sistema de aliases en C1 y C2: C1 Input agrega campo opcional "Nombres/aliases de participantes", Output agrega "Aliases pre-cargados (sin reclamar)", Gherkin agrega 2 scenarios (creador con y sin aliases). C2 completamente reescrito con Modo A (reclamar alias pre-cargado) y Modo B (ingresar alias propio) — descripcion, User Stories duales, inputs por modo, outputs, 6 scenarios Gherkin. Sincronizado con PRD v1.4. |
