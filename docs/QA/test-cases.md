# 🧪 Casos de Prueba - SplitFlow

## Módulo: Gestión de Gastos y Balances

Casos de Prueba QA
Descripción

Este documento contiene el relevamiento y ejecución de los casos de prueba realizados sobre la aplicación, con foco inicial en el módulo de Creación de grupo e invitación de participantes y funcionalidades relacionadas con el registro y división de gastos.

Los casos de prueba tienen como objetivo validar el comportamiento funcional de la aplicación, detectar desvíos respecto de los requerimientos definidos y registrar las incidencias encontradas durante la ejecución.

Estado de ejecución
Estado	Cantidad
Casos ejecutados	6
Casos pendientes	5
Total de casos planificados	11
Casos ejecutados
ID	Caso de prueba	Resultado
CP-001	Creación de grupo sin registro	❌ Falló
CP-002	Agregar participante como alias sin reclamar	❌ Falló
CP-003	Unirse a un grupo mediante código de invitación	❌ Falló
CP-004	Código de invitación inválido	❌ Falló
CP-005	Registro de gasto con división equitativa	❌ Falló
CP-006	Registro de gasto con exclusión de un participante	❌ Falló
Casos pendientes

Quedan 5 casos de prueba pendientes de ejecución. Se irán incorporando los resultados y las incidencias correspondientes a medida que avance la ejecución.

Evidencias y resultados

Los casos de prueba completos, incluyendo:

Descripción.

Precondiciones.

Pasos para la reproducción.

Resultado esperado.

Resultado obtenido.

Estado de ejecución.

Observaciones e incidencias.

se encuentran documentados en el siguiente Google Sheet:

📊 Casos de prueba QA:
[https://docs.google.com/spreadsheets/d/1TtbFh83YKn_LwRwaYkOjst00QLZ7CVmYvsNL2etfdgA/edit?usp=sharing]

Incidencias encontradas

Durante la ejecución se detectaron diferentes desvíos funcionales, entre ellos:

El grupo puede crearse con un nombre diferente al ingresado.

El usuario creador no queda registrado correctamente como participante.

Al agregar participantes como alias, se solicita información no contemplada en el flujo, como el correo electrónico.

Los participantes pueden aparecer con un estado diferente al esperado.

El flujo para unirse mediante código de invitación presenta errores.

No es posible acceder correctamente al flujo de validación de códigos inválidos.

La división equitativa de gastos no contempla correctamente a todos los participantes.

Los participantes en estado "sin reclamar" no pueden ser seleccionados correctamente para determinados gastos.

Las incidencias detalladas se encuentran documentadas junto con los casos de prueba correspondientes.

Próximos pasos

 Ejecutar CP-007.

 Ejecutar CP-008.

 Ejecutar CP-009.

 Ejecutar CP-010.

 Ejecutar CP-011.

 Registrar las incidencias encontradas.

 Adjuntar evidencias de los errores detectados.

 Actualizar el estado general de ejecución.

Documentación

La información detallada y actualizada de los casos de prueba se encuentra disponible en el Google Sheet:

Google Sheet: [https://docs.google.com/spreadsheets/d/1TtbFh83YKn_LwRwaYkOjst00QLZ7CVmYvsNL2etfdgA/edit?usp=sharing]

Este documento se actualizará a medida que se ejecuten los casos de prueba pendientes y se incorporen nuevas evidencias o incidencias.

