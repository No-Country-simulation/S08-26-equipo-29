# 💸 SplitFlow - Proyecto de Testing Manual (QA)

 Este repositorio contiene la estrategia y documentación del ciclo de pruebas manuales realizado para **SplitFlow**, una solución digital diseñada para simplificar la gestión y división de gastos compartidos entre grupos de personas.

El objetivo principal de este proyecto de testing fue garantizar la **transparencia, exactitud matemática en los balances y usabilidad** de la plataforma, transformando un proceso tradicionalmente confuso en una experiencia simple y clara.

---

## 🎯 El Desafío del Negocio
Compartir gastos (viajes, cenas, alquileres) suele volverse caótico cuando intervienen múltiples pagadores y personas que no participan de todos los consumos. SplitFlow busca responder tres preguntas clave de forma instantánea:
* ¿Cuánto gastó el grupo en total?
* ¿Cuánto pagó efectivamente cada integrante?
* ¿Quién le debe a quién y el monto exacto?

---

## 🗂️ Documentación del Ciclo de Pruebas (Entregables)
He estructurado el proceso de QA en tres fases clave dentro de este repositorio. Puedes navegar por cada documento haciendo clic en los siguientes enlaces:

* [📋 **Plan de Pruebas (test-plan.md)**](./test-plan.md): Define el alcance de la prueba, los entornos validados (Mobile/Desktop) y la estrategia general de calidad.
* [🧪 **Casos de Prueba (test-cases.md)**](./test-cases.md): Detalla los escenarios diseñados paso a paso, incluyendo flujos ideales de división equitativa y flujos alternativos (exclusión de participantes).
* [📊 **Reporte de Ejecución y Bugs (test-report.md)**](./test-report.md): Muestra las métricas finales de la ejecución, el estado de los casos y el reporte detallado del bug de redondeo decimal hallado en los balances.

---

## 🛠️ Herramientas y Metodología
* **Técnicas de Caja Negra:** Partición de equivalencia y análisis de valores límite (esenciales para validar los montos numéricos ingresados).
* **Gestión de Artefactos:** Markdown directamente en GitHub para un control de versiones ágil y legible de la documentación.
* **Entornos Probados:** Emuladores de dispositivos móviles (Chrome DevTools) y navegadores de escritorio comerciales.

