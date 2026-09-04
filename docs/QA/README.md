# 🗺️ Plan de Pruebas - SplitFlow

## 1. Alcance (Scope)
Este plan cubre las pruebas funcionales de la experiencia de usuario (UX/UI) de la aplicación **SplitFlow**, enfocándose en resolver el dolor de la división confusa de cuentas.

### En Alcance (In Scope):
* Creación de un grupo de gastos compartidos.
* Registro de un gasto, asignando un pagador y múltiples participantes.
* Cálculo automático de saldos y deudas cruzadas.
* Visualización del resumen de deudas ("Quién debe a quién").

### Fuera de Alcance (Out of Scope):
* Integración con pasarelas de pago reales (Transferencias bancarias desde la app).
* Gestión de múltiples divisas (Monedas extranjeras).

## 2. Tipos de Prueba a Realizar
* **Pruebas Funcionales:** Validación de flujos de finanzas y cálculos matemáticos.
* **Pruebas de Usabilidad (UX):** Verificar que la interfaz sea clara, simple y transparente.
* **Pruebas de Regresión:** Validar que los balances no se corrompan al editar o eliminar gastos.

## 3. Entorno de Pruebas (Environment)
* **Dispositivo:** Mobile (Android 14 / Chrome Mobile) y IOS 
* Desktop (Windows 11 / Google Chrome).
