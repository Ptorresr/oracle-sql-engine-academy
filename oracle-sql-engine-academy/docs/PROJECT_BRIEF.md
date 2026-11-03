# Project brief

## Visión
Enseñar Oracle SQL intermedio/avanzado a desarrolladores y DBAs mediante una plataforma visual que explique **qué es**, **cómo funciona** y **para qué sirve** cada concepto, con al menos tres casos de uso por módulo.

## Público
Desarrolladores Oracle SQL, DBAs, arquitectos y estudiantes técnicos.

## Experiencia
- Estilo documental y navegación inspirados en OCI PoC RunBook; diseño oscuro y panel de simulación inspirado en dashboard OCI. Copiar solo patrones de diseño, no contenido ni activos sin licencia.
- En cada módulo: introducción, anatomía interactiva, simulación paso a paso, explicación interna, 3 casos de uso, SQL ejecutable en Oracle, ejercicio y referencias.
- Vistas sincronizadas: Developer (filas), Execution Plan (operadores), Internals (SGA/Buffer Cache, PGA, TEMP, storage).
- Controles: Play/Pause, Step, Reset, velocidad y selección de componentes.
- Infografías SVG accesibles y con leyendas.
- IA: tutor contextual de reglas locales inicialmente; SQL Analyzer; What-if; Vector Search; Select AI; RAG. Etiquetar claramente simulación vs IA real.

## Exactitud técnica
- No presentar flujo de filas entre operadores como movimiento físico idéntico entre memorias.
- No afirmar que EXPLAIN PLAN es ejecución real; diferenciar estimaciones de DISPLAY_CURSOR con estadísticas.
- Buffer gets, physical reads, PGA/TEMP y tiempos simulados deben rotularse como ilustrativos.
- No afirmar que un método JOIN siempre es mejor.

## Definition of Done por módulo
1. Qué es / cómo funciona / para qué sirve.
2. Tres casos distintos con entrada, SQL, salida y explicación.
3. Animación determinista reproducible, controles funcionales y reducción de movimiento.
4. Al menos una infografía SVG legible en móvil.
5. Ejemplos Oracle SQL validados con datasets, incluyendo NULL y cardinalidad.
6. Sección Developer y DBA; accesibilidad por teclado y contraste.
7. Sin dependencias de backend para la experiencia básica.
