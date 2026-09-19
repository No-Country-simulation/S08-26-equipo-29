---
kind: synthesis
project: splitflow
date: 2026-09-03
status: draft
tags:
  - project/splitflow
  - type/synthesis
  - phase/discovery
---

# Sintesis Cross-Benchmark — SplitFlow

**Apps analizadas:** Tricount (Julian) · Splid · Splital · Splitwise
**Fecha:** 2026-09-03 · **Status:** draft para validacion con el equipo

---

## Tabla comparativa por vector

|Vector|Tricount|Splid|Splital|Splitwise|
|---|---|---|---|---|
|**Descargas / Rating**|21M / 4.8|1M+ / 4.9|150k / 4.7|30M+ / 4.6|
|**Posicionamiento**|La mas facil|No mas calculos manuales|Sin estres|Tu registras, ella calcula|
|**Registro obligatorio**|No|No|No|Si (unica)|
|**Pasos hasta 1er saldo**|~11|~7|~6|~8|
|**Empty state guiado**|Si (texto + CTA)|No documentado|No documentado|Si|
|**Campos min. para gasto**|4 (titulo, monto, pagador, division)|3-4 (monto, pagador, participantes)|3-4 (formulario en una vista)|4-5 (mas opciones de categorizacion)|
|**Multiples pagadores**|No|Si (unica)|No claro|No claro|
|**Metodos de division**|Iguales, partes, importes|Iguales, montos, personalizado|Iguales, montos, porcentajes|Iguales, montos, porcentajes, por item|
|**Feedback inline ($ sin asignar)**|No|No|No|No|
|**Saldos simplificados (neteo)**|Si|Si|Si|Si|
|**Desglose trazable saldo → gastos**|No|No|No|Parcial (mejor que el resto)|
|**Estados de pago**|Binario (pendiente/pagado)|Fuera de la app|Un tap (binario)|Binario + integracion de pago|
|**Confirmacion cruzada de pago**|No|No|No|No|
|**Notificaciones/recordatorios**|Limitado|No|Si (avisos del grupo)|Si|
|**Integracion de pagos**|PayPal (via bunq)|No|No|Venmo, Zelle (unica con ciclo cerrado)|
|**Busqueda/filtros**|Lupa basica|No|No claro|Premium (tags, CSV)|
|**Multi-moneda**|Si (moneda base + conversion)|No documentado|No documentado|Si (conversion)|
|**Offline**|No documentado|Si (unica offline-first)|No documentado|No|
|**Exportar**|No documentado|Si (PDF/Excel)|No|Premium|

---

## Nivel 3 — Sintesis cross-app

### 1. ¿Que hace bien el 80% de las apps? → Convencion que SplitFlow debe respetar

Estos patrones estan tan establecidos que romperlos generaria friccion innecesaria:

- **No exigir registro para empezar.** 3 de 4 apps permiten crear un grupo sin cuenta. Splitwise es la excepcion y es su principal critica en reviews. SplitFlow no debe bloquear el primer uso con un muro de registro.
- **Partes iguales como default de division.** Las 4 apps lo presentan como la primera opcion. Es el mental model mas natural: "dividimos entre todos". SplitFlow debe hacer lo mismo.
- **Simplificacion/neteo automatico de deudas.** Las 4 apps reducen N transferencias al minimo viable. Es el valor base que el usuario ya espera de cualquier app de este tipo. No implementar neteo seria percibido como un bug.
- **"Mark as paid" sin pasarela de pagos.** Las 4 apps permiten cerrar una deuda manualmente, sin depender de integracion bancaria. Es la solucion realista para LATAM donde no hay un Venmo universal.
- **Lista de grupos como pantalla de inicio.** 3 de 4 apps abren con la lista de grupos; Splitwise agrega tabs (Grupos/Amigos/Actividad). El patron es claro: el grupo es la unidad organizativa central.

### 2. ¿Que hace mal el 80% de las apps? → Oportunidad real de diferenciacion

Estos gaps son consistentes y son el territorio donde SplitFlow puede competir:

- **Trazabilidad de saldos: nadie explica de donde viene el numero.** Tricount no lo hace. Splid obliga al usuario a "hacer el calculo mental". Splital lo reconoce como falta de informacion. Splitwise es la unica con trazabilidad parcial, pero sigue requiriendo navegacion entre tabs. Ninguna app cumple el patron del brief: "Juan debe $25.000 → $12.000 alojamiento, $8.000 super, $5.000 transporte" visible desde la pantalla de saldos.
- **Estados de pago binarios.** Todas manejan pendiente/pagado sin estados intermedios. Ninguna tiene "pago iniciado" ni confirmacion cruzada (que el acreedor valide que recibio). Cualquiera puede marcar como pagado unilateralmente, lo que abre la puerta a disputas.
- **Zero feedback durante la division por monto.** Ninguna app muestra en tiempo real cuanto falta por asignar mientras el usuario reparte un gasto por consumo. Es exactamente el momento de mayor carga cognitiva.
- **Sin adaptacion para grupos grandes.** Tricount usa la misma UI para 3 o 40 personas. Splid no tiene limite pero tampoco busqueda. El escenario del brief (10 personas + 35 gastos) no tiene solucion dedicada en ninguna app.

### 3. ¿Que hace solo una app bien? → Referente puntual

|App|Que hace bien (unica)|Referencia para SplitFlow|
|---|---|---|
|**Splitwise**|Trazabilidad parcial de deudas: cada gasto actualiza la tabla y el usuario ve el registro|Es el punto de partida, pero SplitFlow debe ir mas alla con desglose expandible|
|**Splitwise**|Integracion de pago real (Venmo/Zelle) para cerrar el ciclo|No viable para MVP en LATAM, pero marca la direccion a futuro|
|**Splid**|Multiples pagadores en un mismo gasto|Escenario real: "pagamos la cena entre dos tarjetas". SplitFlow deberia soportarlo|
|**Splid**|Offline-first + exportar a PDF|Relevante si hay viajes sin conexion; exportar es prueba de transparencia|
|**Splital**|Liquidacion en un solo tap desde la vista de saldos|UX de cierre de deuda mas fluido del grupo; SplitFlow puede tomarlo como benchmark de flujo|
|**Tricount**|Importar desde Splitwise|Estrategia de adquisicion: capturar usuarios que migran|

### 4. ¿Que no hace ninguna app? → Territorio nuevo

Estos gaps no son features "nice to have" — mapean directamente a pain points y criterios del brief:

1. **Desglose expandible de saldos.** Tap en "$25.000 a Maria" → se expande y muestra los gastos que componen ese numero. Es el criterio de exito #8 del brief. Ninguna app lo resuelve.
2. **Feedback inline en el formulario de gasto.** "$5.000 sin asignar" visible mientras el usuario reparte por consumo. Reduce carga cognitiva en el momento mas critico (PP#2).
3. **Estado intermedio de pago.** Pendiente → Pago iniciado → Confirmado por el acreedor. Resuelve el PP#5 con mas granularidad que el binario actual.
4. **Vista adaptativa para grupos grandes.** Filtros, busqueda, o progressive disclosure cuando el grupo supera cierto umbral. Resuelve PP#4.

### 5. ¿Cuales de los 10 criterios del brief ninguna app resuelve con claridad?

|#|Criterio|Tricount|Splid|Splital|Splitwise|Veredicto|
|---|---|---|---|---|---|---|
|1|Crear un grupo|OK|OK|OK|OK|Resuelto|
|2|Invitar participantes|OK|OK|OK|OK|Resuelto|
|3|Registrar un gasto|OK|OK|OK|OK|Resuelto|
|4|Seleccionar quienes participan|OK|OK|OK|OK|Resuelto|
|5|Definir como dividirlo|OK|OK|OK|OK|Resuelto (variaciones en metodos)|
|6|Consultar cuanto corresponde|OK|OK|OK|OK|Resuelto|
|7|Visualizar sus deudas|Parcial|Parcial|Parcial|OK|Resuelto con fricciones|
|8|**Comprender de donde surge cada importe**|**NO**|**NO**|**NO**|**Parcial**|**GAP PRINCIPAL**|
|9|Registrar un pago|OK|Debil|OK|OK|Resuelto (con binario)|
|10|Identificar cuando todo esta saldado|Basico|Basico|Basico|Basico|Resuelto sin celebracion|

**El criterio #8 es el gap mas consistente y el mas alineado con el pain point central del brief (PP#7).** Es el espacio donde SplitFlow puede construir su diferenciador.

---

## Conclusiones globales

---

### Conclusion 1 — El diferenciador unico de SplitFlow

> **"SplitFlow es la unica app que hace trazable cada saldo: cuando ves que debes $25.000, puedes expandir ese numero y ver exactamente de que gastos viene."**

**Evidencia del benchmark:**
- Tricount optimiza transacciones pero sacrifica trazabilidad — el usuario no sabe de donde sale el numero.
- Splid muestra quien gasto cuanto pero obliga al usuario a hacer el calculo mental.
- Splital reconoce la falta de informacion en sus propios saldos.
- Splitwise es la unica con trazabilidad parcial, pero requiere navegar entre tabs para reconstruir el origen.

**Ninguna de las 4 apps resuelve el patron que el brief define como criterio de exito #8:**

```
Juan debe $25.000
  $12.000 — alojamiento
  $8.000  — supermercado
  $5.000  — transporte
```

Este no es un feature inventado — es literalmente lo que el brief pide y el mercado no da. Si el equipo logra que este patron funcione en la pantalla de saldos con un tap, el pitch ante evaluadores tiene un argumento concreto y demostrable.

---

### Conclusion 2 — El flujo de gasto minimo viable

Comparando los formularios de las 4 apps contra los pain points del registro (PP#1 registro fragmentado, PP#2 division imprecisa):

**Campos obligatorios para MVP:**

|#|Campo|Justificacion|
|---|---|---|
|1|**Monto**|Sin esto no hay gasto. Universal en las 4 apps.|
|2|**Quien pago**|Distinguir pagador de participantes. Todas lo piden.|
|3|**Quienes participan**|Default: todos. El usuario desmarca si no aplica.|

**Campos deseables (no bloqueantes):**

|Campo|Razon para incluirlo|Razon para no bloquearlo|
|---|---|---|
|Titulo/descripcion|Contexto para trazabilidad|Puede quedar vacio o autocompletarse|
|Fecha|Tricount y Splitwise lo piden|Default a "hoy" resuelve el 90%|
|Categoria|Solo Splitwise lo usa fuerte|Agrega carga en MVP sin valor inmediato|

**Modos de division para MVP (2 obligatorios, 1 deseable):**

|Prioridad|Modo|Por que|
|---|---|---|
|Obligatorio|**Partes iguales**|Convencion de mercado (100% de las apps). Default.|
|Obligatorio|**Por monto/consumo**|Resuelve PP#2 directamente. "La cena de $60.000 donde cada uno consumio distinto."|
|Deseable|Por porcentaje|Util pero menos frecuente. Puede esperar post-MVP.|

**Quick win sobre la competencia en el formulario:**
Feedback inline: **"$5.000 sin asignar"** visible en tiempo real mientras el usuario reparte por monto. Ninguna app lo hace. Reduce carga cognitiva en el momento mas critico del flujo.

**Target de interacciones:** 5-7 taps desde "agregar gasto" hasta confirmar. Splital lo logra en ~6, Tricount en ~7-8. Ese es el rango competitivo.

---

### Conclusion 3 — La pantalla mas critica del diseno

**Confirmado por el benchmark: es la vista de saldos.**

Las 4 apps cometen el mismo error de arquitectura: separan "lista de gastos" (Expenses) y "saldos" (Balances) en tabs o vistas independientes. El resultado es que el usuario ve un numero pero no entiende de donde viene, y tiene que navegar manualmente a otra pantalla para reconstruir la historia.

**La apuesta de SplitFlow:**

La vista de saldos no es un tab separado de los gastos — es una **vista que fusiona el resultado con su origen:**

1. **Estado default:** muestra los saldos netos simplificados (convencion del mercado, hay que respetarla).
2. **Al hacer tap en un saldo:** se expande para mostrar los gastos individuales que lo componen (el diferenciador).
3. **Estado de pago visible:** cada saldo muestra si esta pendiente, iniciado, o confirmado (mejora sobre el binario del mercado).

**Por que esta es la pantalla critica y no el formulario de gasto:**
- El formulario es un momento de *entrada* — el usuario tiene la informacion en la cabeza porque acaba de gastar.
- La vista de saldos es un momento de *salida* — el usuario necesita entender un calculo que hizo la app, no el. Si no entiende, no confia. Si no confia, no paga.

El brief lo dice textualmente: la transformacion es pasar de *"tenemos que hacer cuentas"* a *"la plataforma nos muestra cuanto corresponde pagar, a quien y por que"*. Ese **"por que"** es el desglose expandible. Es donde SplitFlow gana o pierde.

---

## Siguiente paso

Este documento alimenta directamente **01 Framing & Strategy**: con el diferenciador, el flujo minimo y la pantalla critica definidos, el equipo puede pasar a disenar los flujos core y las primeras pantallas.

---

## Fuentes

- [Brief del Reto - No Country](brief-del-reto-no-country.md)
- [(C) Benchmark - Tricount](benchmark-tricount.md)
- `splid_benchmark.png` — card del equipo
- `Splital_benchmark.png` — card del equipo
- `splitwise_benchmark.png` — card del equipo
