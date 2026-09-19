# 🗺️ Plan de Pruebas - SplitFlow

## 1. Alcance (Scope)

Este plan cubre las pruebas funcionales de la experiencia de usuario (UX/UI) de la aplicación **SplitFlow**, enfocándose en resolver el dolor de la división confusa de cuentas compartidas y la falta de trazabilidad sobre el origen de cada deuda.

### En Alcance (In Scope):

- Creación de un grupo de gastos compartidos, sin registro obligatorio (identidad anónima vía UUID local).
- Invitación de participantes por alias sin reclamar, link de invitación y código de invitación manual.
- Registro de un gasto, asignando un pagador y participantes, con los dos modos de división del MVP (partes iguales / montos exactos).
- Cálculo automático de saldos y deudas cruzadas entre múltiples integrantes.
- Visualización del resumen de deudas ("Quién debe a quién"), incluyendo el desglose del origen de cada monto (trazabilidad por gasto).
- Sugerencia de liquidación optimizada (optimizador de deuda) — **mockeada con datos de ejemplo en esta fase**, no como cálculo funcional en producción.
- Flujo de estado de pago con confirmación mutua (Pendiente → Pago iniciado → Pagado / Rechazado).
- Detalle de gasto individual (pantalla de solo lectura).

### Fuera de Alcance (Out of Scope):

- Integración con pasarelas de pago reales (transferencias bancarias desde la app).
- Gestión de múltiples divisas (monedas extranjeras).
- Multi-pagador por gasto.
- Edición o eliminación de gastos ya cargados.
- División de gastos por ítem de ticket (foto de recibo).
- Notificaciones push reales (se valida solo el estado visible dentro de la app).
- Pantalla dedicada de cierre de grupo saldado (se valida el estado calculado, no una pantalla propia).

## 2. Tipos de Prueba a Realizar

- **Pruebas Funcionales:** validación de flujos de creación de grupo, registro de gasto y cálculos matemáticos de división y saldos.
- **Pruebas de Usabilidad (UX):** verificar que la interfaz sea clara, simple y transparente — en particular, que la vista de saldos permita entender el origen de cada deuda sin ayuda externa.
- **Pruebas de Regresión:** validar que los balances no se corrompan al agregar nuevos gastos o participantes a un grupo existente.
- **Pruebas de Compatibilidad:** validar la experiencia en los entornos definidos en la sección 3.

## 3. Entorno de Pruebas (Environment)

| Entorno | Dispositivo / SO | Navegador | Resolución de referencia |
|---|---|---|---|
| Mobile (prioritario) | Android 14, Samsung Galaxy A-series | Chrome Mobile 126+ | 360×800 px |
| Mobile (secundario) | iOS 17, iPhone 13 | Safari 17 | 390×844 px |
| Desktop | Windows 11 | Google Chrome 126+ | 1440×900 px |

**Justificación:** Android + gama media es el perfil de dispositivo dominante del persona (Camila, LatAm), por lo que las pruebas mobile tienen prioridad sobre desktop. Desktop se valida como entorno secundario dado que el producto es mobile-first.

## 4. Criterios de aceptación

Las pruebas de este ciclo se consideran satisfactorias si se cubren, con evidencia de al menos un caso de prueba exitoso, los 10 criterios de éxito definidos en el brief del proyecto (crear grupo, invitar, registrar gasto, seleccionar participantes, definir división, consultar montos, visualizar deudas, comprender el origen del importe, registrar un pago, e identificar cuándo el grupo está saldado).

## 5. Roles y responsabilidades

| Rol | Responsabilidad |
|---|---|
| QA | Diseñar y ejecutar los casos de prueba, reportar bugs con severidad y prioridad |
| Diseño (UX/UI) | Validar hallazgos de usabilidad y proponer ajustes de interfaz |
| Desarrollo | Corregir bugs funcionales reportados y confirmar resolución para retest |
