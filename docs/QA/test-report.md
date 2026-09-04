# 📊 Reporte de Ejecución de Pruebas - SplitFlow

## 1. Resumen Ejecutivo
Se ejecutaron los ciclos de prueba sobre la build v1.0.0 de SplitFlow. Se validó la lógica matemática del backend y la claridad de la interfaz en los resúmenes de deuda.

* **Casos Planificados:** 5
* **Casos Ejecutados:** 5
* **Casos Exitosos (Passed):** 4
* **Casos Fallidos (Failed):** 1

## 2. Detalle de Bugs Encontrados

### 🐛 BUG-001: Error de redondeo decimal en balances del grupo
* **Severidad:** Media | **Prioridad:** Alta
* **Descripción:** Al dividir un gasto cuyo resultado genera decimales infinitos (ej. dividir $100 entre 3 personas), el sistema pierde centavos en el total acumulado de deudas, arrojando sumas inconsistentes.
* **Resultado Actual:** El sistema muestra que cada uno debe `$33.33` (Total: `$99.99`), dejando `$0.01` flotando en el aire sin asignar al balance general.
* **Resultado Esperado:** El sistema debe aplicar una regla de redondeo financiero o asignar la diferencia del centavo sobrante al pagador original para mantener la transparencia matemática total.  <<<TODO ES EJEMPLO PARA ANTES DEL DEMO

