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

📊 Reporte de Ejecución de Pruebas - SplitFlow
1. Resumen Ejecutivo
Se ejecutó el ciclo de pruebas sobre el build actual de SplitFlow (pago unilateral con comprobante, sin optimizador de deuda), cubriendo los 15 casos definidos en `test-cases.md`.
Casos Planificados: 15
Casos Ejecutados: 13
Casos Aprobados (Passed): 12
Casos Fallidos (Failed): 1
Casos No Ejecutados: 2
2. Resultado por caso de prueba
Caso	Descripción	Resultado
CP-001	Creación de grupo sin registro	✅ Aprobado
CP-002	Agregar participante como alias sin reclamar	✅ Aprobado
CP-003	Unirse a un grupo mediante código de invitación	✅ Aprobado
CP-004	Código de invitación inválido	✅ Aprobado
CP-005	Registro de gasto con división equitativa	✅ Aprobado
CP-006	Registro de gasto con exclusión de un participante	✅ Aprobado
CP-007	Registro de gasto con montos exactos (división desigual)	✅ Aprobado
CP-008	Validación de montos exactos que no cierran con el total	✅ Aprobado
CP-009	Redondeo decimal en división equitativa no exacta	✅ Aprobado
CP-010	Desglose de origen de una deuda	✅ Aprobado
CP-011	Navegación al detalle de gasto individual	✅ Aprobado
CP-012	Sugerencia de liquidación optimizada (mockeada)	❌ Fallido — ver BUG-003
CP-013	Marcar/informar un pago	✅ Aprobado
CP-014	Confirmación mutua de pago	⬜ No ejecutado
CP-015	Rechazo de un pago marcado como iniciado	⬜ No ejecutado
Nota sobre CP-014 y CP-015: no se ejecutaron porque el build actual implementa el cierre de pago como unilateral (informar pago con comprobante, sin paso de confirmación de la contraparte) — la interacción de "confirmar" o "rechazar" que estos dos casos requieren no existe en la pantalla actual. Quedan como no ejecutados, no como fallidos, hasta que el equipo confirme si la confirmación mutua se incorpora en una próxima iteración.
3. Detalle de Bugs Encontrados
🐛 BUG-003: La liquidación sugerida no coincide con los saldos del escenario
Caso de prueba asociado: CP-012
Severidad: Media | Prioridad: Alta
Descripción: Al generarse la sugerencia de liquidación optimizada en un escenario de deudas cruzadas entre 3 o más personas, el sistema muestra una sugerencia que no coincide con los saldos esperados del escenario y/o propone participantes o importes que no corresponden a los consumos registrados.
Resultado esperado: La sugerencia debe indicar exactamente qué persona le paga a qué persona y por qué monto, de forma consistente con los saldos individuales ya calculados en la vista de saldos.
Resultado obtenido: El sistema muestra una sugerencia de liquidación que no coincide con los saldos esperados del escenario y/o propone participantes o importes que no corresponden a los consumos registrados.
> ⚠️ **Pendiente de completar:** falta documentar aquí el mensaje exacto mostrado por la aplicación y los importes sugeridos durante la ejecución (capturar texto literal y montos antes de reportar el bug al equipo de desarrollo).
Estado: Abierto.
🐛 BUG-001: Error de redondeo decimal en balances del grupo — ✅ Resuelto
Caso de prueba asociado: CP-009
Estado: Resuelto — se verificó en esta ejecución que la diferencia de centavos se asigna correctamente y la suma total coincide con el monto cargado. Caso reclasificado como Aprobado.
🐛 BUG-002: Deuda sin resolución visible cuando la contraparte no confirma el pago — No aplica en este ciclo
Casos de prueba asociados: CP-014, CP-015
Estado: No aplica — ambos casos quedaron sin ejecutar porque el flujo de confirmación mutua no existe en el build actual (ver nota en la sección 2). Se mantiene documentado por si la confirmación mutua se reincorpora más adelante.
4. Cobertura de criterios de éxito del brief
Criterio de éxito	Cubierto por	Estado
Crear un grupo	CP-001	✅ Aprobado
Invitar participantes	CP-002, CP-003, CP-004	✅ Aprobado
Registrar un gasto	CP-005, CP-006, CP-007	✅ Aprobado
Seleccionar quiénes participan	CP-006	✅ Aprobado
Definir cómo dividirlo	CP-005, CP-007, CP-008	✅ Aprobado
Consultar cuánto corresponde a cada persona	CP-005, CP-007	✅ Aprobado
Visualizar sus deudas	CP-010	✅ Aprobado
Comprender de dónde surge cada importe	CP-010, CP-011	✅ Aprobado
Registrar un pago	CP-013	✅ Aprobado
Identificar cuándo todas las cuentas están saldadas	CP-013 (estado del grupo)	✅ Aprobado
5. Conclusión
De los 10 criterios de éxito del brief, los 10 quedan cubiertos por casos aprobados. El único hallazgo abierto (BUG-003) corresponde a una funcionalidad fuera del flujo principal (sugerencia de liquidación optimizada), que además sigue sin estar confirmada como parte del alcance del MVP (Conflicto A, sin resolver con el equipo). Se recomienda completar el detalle exacto del BUG-003 antes de reportarlo a desarrollo, y decidir junto al equipo si CP-014/CP-015 se dan de baja definitivamente del ciclo o quedan pendientes para una futura versión con confirmación mutua.
