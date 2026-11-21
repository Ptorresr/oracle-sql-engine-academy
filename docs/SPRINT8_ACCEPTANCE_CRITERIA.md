# Sprint 8 — Criterios de aceptación y estrategia de QA

**Estado:** gates 8.1–8.7 superados localmente; publicación y revisión final permanecen pendientes de aprobación.
**Principio:** las pruebas automatizadas no sustituyen la revisión técnica ni permiten afirmar cumplimiento WCAG completo. Todas las verificaciones deben ejecutarse sin Oracle Database real, backend, LLM, credenciales ni dependencias de producción nuevas.

## Matriz de aceptación general

| Área | Criterio verificable | Evidencia esperada | Estado de planificación |
| --- | --- | --- | --- |
| Modelo | Escenarios inmutables con SQL de referencia, datos sintéticos, supuestos, límites y tres casos por laboratorio. | Tests de inmutabilidad + revisión de contenido. | 8.1–8.6 validados localmente. |
| Determinismo | Mismo escenario, parámetros normalizados y semilla producen la misma secuencia/estado. | Tests de igualdad de timeline y `stateAt`. | 8.1–8.6 validados localmente. |
| Eventos | Todos los eventos conservan contrato base y arrays válidos; extensiones opcionales son compatibles. | Suite del adaptador y regresiones HASH/Comparison/AI. | 8.1–8.7 validados localmente. |
| Métricas | Se distingue entrada, métrica ilustrativa, valor importado y cálculo derivado. | Assertions de origen/ausencia y leyendas en UI. | 8.1–8.6 validados localmente. |
| Inspector | Un único inspector sincroniza evento, fila, bloque, operador y componente. | Pruebas DOM/navegador y selección cruzada. | 8.2–8.7 validados localmente. |
| Animación | Cada ruta/partícula corresponde a un evento; no hay autoplay en entrada ni con reduced motion. | Tests de overlay + navegador. | 8.2–8.7 validados localmente. |
| Presentation | Usa los controles/timeline del laboratorio, sin control global paralelo ni timers duplicados. | Tests de registro, Play/Pause/Step/Reset y Escape. | Validado localmente en 8.7. |
| RunBook | Capítulo 15 conserva 01–14, rutas directas, historial, estado activo único y progreso local. | Tests de contrato + Chrome. | Validado localmente en 8.7. |
| Seguridad | Sin ejecución de SQL, HTML importado, backend, secretos, URLs externas inesperadas o dependencias no autorizadas. | Escaneo estático, pruebas hostiles, revisión de recursos. | Validado mediante análisis local; revisión final pendiente. |
| GitHub Pages | Recursos relativos/locales, carga diferida controlada y funcionamiento desde la raíz estática. | Servidor local estático, red/console limpia. | Validado localmente en 8.7. |

## Criterios por incremento

### Sprint 8.1 — Foundation & Event Model

| Aspecto | Debe cumplir | Pruebas previstas |
| --- | --- | --- |
| Escenarios base | Declarar parámetros, unidades educativas, supuestos, límites y versiones sin DOM ni mutación. | Imports en Node, deep freeze/copia, validación de schema ligero. |
| Adaptador | Conserva `step`, `type`, `source`, `target`, `rowIds`, `blockIds`, `label`, `illustrativeMetrics`; no exige campos nuevos a timelines previos. | Fixtures de HASH JOIN, Comparison, plan timeline y evento de rendimiento candidato. |
| Métricas | Etiqueta el origen; no convierte ausencias en cero ni Cost en tiempo. | Fixtures con métrica ausente, cero explícito y valor importado abreviado. |
| Determinismo | Evita tiempo, azar y estado global mutable. | Dos creaciones consecutivas con deep equality y reconstrucción con `stateAt`. |
| Errores | Parámetros inválidos producen validación/advertencia controlada, no HTML ni excepción no gestionada en UI. | Capacidad negativa, tipo inválido, arrays vacíos y IDs desconocidos. |

**Gate:** no se crea un laboratorio visual hasta que estos tests y la revisión de compatibilidad estén aprobados.

### Sprint 8.2 — Buffer Cache & I/O

| Aspecto | Debe cumplir | Pruebas previstas |
| --- | --- | --- |
| Secuencia | Cada solicitud de bloque emite `READ_BLOCK` y exactamente un resultado `CACHE_HIT` o `CACHE_MISS` antes del acceso representado. | Cache fría, caliente, bloque repetido y capacidad mínima. |
| Estado | La caché conceptual evoluciona únicamente según la regla declarada y Reset recupera el estado inicial. | Reproducibilidad, Previous/Next/Reset y cambio de tema. |
| Métricas | Solicitudes lógicas y lecturas físicas conceptuales se presentan como ilustrativas y no como equivalencia obligatoria. | Assertions de textos/leyendas y snapshot de inspector. |
| Selección | Evento, bloque y fila representados resaltan las tres vistas y el inspector muestra datos correctos. | Navegador: click/teclado, foco y `aria-current` de timeline. |
| Límites | No asume algoritmo real de replacement, prefetch, RAC o latencia. | Revisión de contenido y prueba de que no hay texto absoluto prohibido. |

**Resultado local 8.2:** `tests/buffer-cache-engine.test.js`, `tests/buffer-cache-renderer.test.js`, `tests/animated-data-flow.test.js` y `tests/performance-event-contract.test.js` pasan junto con las 28 suites Node. CDP confirmó estados sincronizados de miss, hit y reemplazo FIFO, SQL relacionado, tutor, 375/768/1440 px sin overflow y tema claro/oscuro. Play/Pause/Previous/Next/Reset operan sobre el mismo timeline; 1×/2×/4× muestran cadencias diferenciadas. Enter/Espacio, Tab/Shift+Tab, foco visible, timeline y componentes SVG se verificaron con eventos nativos de navegador; reduced motion deshabilita Play, mantiene Next y elimina animación continua. `--headless --screenshot` produce PNG negro por el compositor macOS, pero `Page.captureScreenshot({ fromSurface: true })` genera la evidencia válida. La flecha de un `<select>` nativo no cambia la opción bajo inyección CDP macOS; queda como comprobación manual de plataforma, no como defecto confirmado del laboratorio.

### Sprint 8.3 — PGA, Work Areas & TEMP

| Aspecto | Debe cumplir | Pruebas previstas |
| --- | --- | --- |
| Workarea | Una operación declara asignación y consumo en unidades educativas. | HASH y SORT, filas cero, límite exacto, límite suficiente e insuficiente. |
| TEMP | `SPILL_TEMP`, `TEMP_WRITE` o `TEMP_READ` se emiten solo si la regla de escenario lo exige; una lectura TEMP requiere un estado previo coherente. | Umbral límite, secuencia de evento y reset. |
| Semántica | PGA se presenta como área de trabajo conceptual privada, no caché compartida de datos. | Revisión semántica/DOM de leyendas. |
| Datos | NULL/duplicados y tamaños de fila inválidos no corrompen resultados lógicos ni métricas. | Fixtures y tests de validación. |
| Inspector/plan | Operador, workarea, TEMP, filas y bloques existentes se seleccionan y explican sin inventar evidencia. | Tests de renderer + navegador. |

**Resultado local 8.3:** `tests/workarea-temp-engine.test.js`, `tests/workarea-temp-renderer.test.js`, `tests/performance-event-contract.test.js` y `tests/animated-data-flow.test.js` pasan junto con las 30 suites Node. El motor cubre determinismo, inmutabilidad, límites, HASH JOIN/SORT, cero filas, Optimal, One-Pass, Multi-Pass, pares TEMP balanceados y ausencia deliberada de `SPILL_TEMP` en el timeline nuevo. CDP confirmó selección del timeline, fila, bloque, operador y componente; SQL relacionado, tutor local, controles 1×/2×/4×, Pause, Reset, cambio de tema y ausencia de timers duplicados. Las capturas `fromSurface: true` verificaron 375/768/1440 px, claro/oscuro y sin overflow. Una instancia separada con `--force-prefers-reduced-motion=reduce` deshabilitó Play, eliminó animación continua y mantuvo Next. La auditoría no afirma cumplimiento WCAG completo ni ejecución Oracle real.

### Sprint 8.4 — Optimizer & Cardinality

| Aspecto | Debe cumplir | Pruebas previstas |
| --- | --- | --- |
| Regla visible | La fórmula/regla educativa usa entradas declaradas y muestra su base de decisión. | Matriz de selectividad, índices, distribución y relaciones. |
| Estimación/observación | Las estadísticas de objeto, la estimación y una observación de escenario/importada tienen etiquetas separadas. | Fixtures sin observación, con `Starts > 1`, `Starts = 0`, E-Rows cero y campos ausentes. |
| Alternativas | Un cambio de parámetro puede cambiar la alternativa educativa de acceso/JOIN de manera determinista. | Repetición A/B y snapshot de `decisionBasis`. |
| Honestidad | No llama CBO real a la decisión ni presenta coste como milisegundos. | Revisión de contenido y tests de copy/inspector. |
| Resultados | Cuando compare métodos sobre el mismo dataset, conserva equivalencia lógica usando el contrato existente. | `compareLogicalResults` y datasets con NULL/duplicados. |

**Resultado local 8.4:** `tests/optimizer-cardinality-engine.test.js` y `tests/optimizer-cardinality-renderer.test.js` cubren determinismo, inmutabilidad, redondeo, límites 0/1, cardinalidad cero, estadísticas disponibles/desactualizadas/ausentes, índice, distribución, NULL, duplicados, resultados lógicos y las alternativas educativas. `tests/performance-event-contract.test.js` y `tests/animated-data-flow.test.js` confirman la compatibilidad del timeline y la capa reutilizable. La validación de navegador, teclado, reduced motion, responsive y temas queda registrada en el handoff de este incremento; no afirma WCAG completo, plan real, coste real ni decisión del CBO.

### Sprint 8.5 — Execution Plan Diagnostics

| Aspecto | Debe cumplir | Pruebas previstas |
| --- | --- | --- |
| Parser único | Reutiliza `OraclePlanParser`; no introduce un parser alternativo ni ejecuta SQL. | Imports estáticos y tests existentes del parser. |
| Formatos | Conserva soporte de tabla `Id`/`Operation`, headers variables, jerarquía, operaciones desconocidas, predicados, notes, `*`, abreviaturas y columnas opcionales. | Fixtures `DISPLAY`, `DISPLAY_CURSOR`, tablas incompletas y texto malformado. |
| Estadísticas | `E-Rows`, `A-Rows`, `Starts`, `Buffers`, `Reads`, `A-Time`, Cost y TempSpc solo se muestran si están presentes. | Fixtures con y sin campos; `A-Rows/Starts`, cero y ausencia. |
| Hallazgos | Separa evidencia, interpretación, hipótesis, recomendaciones y limitaciones; no declara SORT/HASH/FULL SCAN como problema inherente. | Assertions sobre findings y texto del inspector. |
| Seguridad | HTML, script, caracteres especiales y texto largo se renderizan como texto inerte. | Pruebas de escape, límite de 200.000 caracteres y DOM sin nodos ejecutables. |

**Resultado local 8.5:** `tests/plan-diagnostics-timeline.test.js` cubre determinismo, inmutabilidad, recorrido reversible, DISPLAY sin observación, DISPLAY_CURSOR, Starts cero/superior a uno, E-Rows cero, métricas ausentes, abreviaturas, operadores desconocidos, raíces múltiples, plan incompleto, contenido hostil y el límite de reproducción que conserva el plan completo. Las suites parser/analyzer/renderer y contrato continúan validando métricas originales, escape y compatibilidad. CDP verificó selector sincronizado, Play/Pause/Previous/Next/Reset, teclado, claro/oscuro, 375/768/1440, ausencia de overflow, reduced motion y ausencia de errores de consola. Esto no afirma una traza real, diagnóstico de producción ni cumplimiento WCAG completo.

### Sprint 8.6 — Performance What-If Lab

| Aspecto | Debe cumplir | Pruebas previstas |
| --- | --- | --- |
| A/B | Cada lado mantiene snapshot de parámetros y timeline propio; editar B no muta A ni el escenario base. | Igualdad previa/posterior, reset y cambios repetidos. |
| Comparación | Reutiliza tracks/controles del Comparison Lab o una abstracción común aprobada; no crea segundo comparador independiente. | Tracks sincronizados/independientes, Play/Pause/Step/Reset y velocidad. |
| Resultados | Compara operadores, cardinalidades, cache/workarea/TEMP ilustrativos y resultado lógico cuando aplica. | Fixtures retail, finanzas, warehouse y comparación canónica. |
| Métricas | No ofrece tiempos fabricados ni precios/mediciones reales. | Revisión estática de interfaz y textos. |
| Explicación | Señala qué cambió, regla aplicable, evidencia disponible y limitación de hipótesis. | Snapshot del inspector/tutor local. |

**Resultado local 8.6:** `tests/performance-what-if-engine.test.js` y `tests/performance-what-if-renderer.test.js` cubren determinismo, inmutabilidad, independencia A/B, reset por reconstrucción, tracks de longitud distinta, Retail/Finanzas/Data Warehouse, selectividad cero, NULL/duplicados declarados, procedencia de métricas, comparabilidad y no comparabilidad. CDP validó tracks, modo sincronizado/independiente, selección reversible con foco restaurado, SQL relacionado, Tutor, temas, 375/768/1440 sin overflow propio y reduced motion con Play deshabilitado y Next manual disponible. La revisión no afirma equivalencia de planes, costes, tiempos ni cumplimiento WCAG completo.

### Sprint 8.7 — RunBook, Presentation & QA

| Aspecto | Debe cumplir | Pruebas previstas |
| --- | --- | --- |
| Navegación | Añade capítulo 15 sin renumerar 01–14; `#database-performance` y rutas internas resuelven después de carga del lab. | Suite RunBook, hash inicial, Back/Forward, anterior/siguiente y estado activo único. |
| Progreso | Abrir no completa; actividades requeridas completan solo el capítulo 15 y conservan progreso previo. | localStorage con datos anteriores, reinicio y reanudación. |
| Presentation | Cinco laboratorios de rendimiento se registran solo si implementan acciones reales; Escape y tema preservan estado. | Registro, controles, foco, reduced motion y ausencia de timers duplicados. |
| Diseño | Usa tokens Redwood, claro/oscuro/sistema sin recargar ni reiniciar simulación. | Tema persistente, `prefers-color-scheme` y capturas comparativas. |
| Publicación | La raíz estática y recursos locales funcionan en GitHub Pages. | Servidor local desde raíz, inspección de red y rutas relativas. |

**Resultado local 8.7:** `tests/database-performance-integration.test.js`, `tests/runbook-chapters.test.js`, `tests/presentation-mode.test.js` y la regresión completa pasaron en 36 suites Node. Chrome/CDP validó capítulo 15, cinco rutas, foco restaurado, Back/Forward, estado activo único, carga local, progreso preservado, actividades educativas, Presentation Mode, Escape, tema, reduced motion y 375/768/1440 px sin overflow del documento. La inyección CDP no modifica la opción de un `<select>` nativo en este macOS headless; la comprobación manual de flechas físicas sigue pendiente de un navegador de escritorio disponible. No se declara cumplimiento WCAG completo.

## Casos negativos y límites obligatorios

| Grupo | Casos que deben existir antes de aceptar el incremento relevante |
| --- | --- |
| Buffer Cache | Capacidad de 0/valor mínimo normalizado, cache inicial inválida, bloque no declarado, secuencia repetida, patrón vacío, cambio de escenario y reset. |
| Workarea | Cero filas, límite exactamente igual, límite inferior, tamaño de fila cero/negativo/no numérico, HASH y SORT, TEMP no solicitado, TEMP solicitado y estado inconsistente. |
| Optimizer | Selectividad 0 y 1, cardinalidad cero, estadística ausente, distribución sesgada, sin índice, varias alternativas válidas, NULL y duplicados. |
| Planes | Cabeceras variables, ID con `*`, operación desconocida, fila inválida, múltiples raíces, predicado no asociable, notes, valores abreviados, `Starts = 0`, estadísticas ausentes y entrada excesiva/hostil. |
| What-If | Variante A intacta tras editar B, restauración total, parámetros no permitidos, resultado lógico equivalente cuando corresponde y tracks de distinta longitud. |
| UI | Evento sin filas/bloques, componente sin evento equivalente, inspector sin plan importado, control deshabilitado honesto, fallo local de carga y foco tras cambio de panel. |
| Seguridad | HTML/script/URL inesperada, texto muy largo, credenciales aparentes, recursos externos y valores que intenten alterar DOM. |

## Validación de accesibilidad, diseño y navegador

### Revisión manual obligatoria

- Teclado completo: Tab/Shift+Tab, Enter/Espacio para eventos, componentes y controles; Escape en Presentation Mode; foco visible después de cambios de panel.
- Etiquetas accesibles: botones con nombre, estados `aria-pressed`/`aria-current` honestos, tablas con encabezados y SVG con título/descripción equivalente.
- Contraste de texto primario/secundario, formularios, códigos SQL, alertas y estados activos según el tema. Los colores semánticos siempre se acompañan de texto, icono o patrón.
- `prefers-reduced-motion`: Play/autoplay desactivado, sin partículas/scroll animado continuo y navegación por estados disponible.

### Capturas y tamaños mínimos

Para cada laboratorio se obtendrán capturas verificadas de 1440 px, 768 px y 375 px. Al menos Buffer Cache, PGA/TEMP, Optimizer, Diagnostics y What-If se revisarán en Claro y Oscuro; Sistema se validará por cambio de preferencia. Se comprobará que no hay overflow horizontal no intencional, paneles superpuestos, SVG desalineados, texto cortado o controles fuera de alcance.

### Automatización disponible

Las suites Node se ejecutarán sin dependencias permanentes nuevas. Si Chrome/Chromium, CDP, Playwright o Puppeteer ya están disponibles, podrán usarse de forma local para navegación, consola y capturas. Si una herramienta como axe no está disponible, se registrará como limitación: no se declarará cumplimiento WCAG completo por pruebas parciales.

## Regresión obligatoria

Antes de integrar Sprint 8 deben seguir funcionando las 25 suites históricas y los flujos de:

- RunBook y Dashboard, incluyendo progreso, temas y rutas de capítulos 01–14.
- Simulaciones JOINs originales, HASH JOIN y SQL Execution Comparison (HASH/NESTED/MERGE).
- AI SQL Intelligence, parser/importador, visualizador, SQL relacionado, tutor local y What-If.
- Oracle AI Database Internals, Architecture Explorer, Architecture Challenges, Animated Data Flow y Presentation Mode.

Además de las nuevas suites, se ejecutarán `node --check` sobre JavaScript modificado, validación estática de `index.html`, `git diff --check`, verificación de recursos locales y un escaneo de secretos/URLs externas de runtime. Los artefactos temporales de navegador se guardarán fuera del repositorio.

## Definición de terminado de Sprint 8

Sprint 8 solo podrá considerarse terminado cuando:

1. Los cinco laboratorios cumplen el contrato educativo y tienen tres escenarios distintos.
2. Todos los motores son deterministas, probados y separados de UI/animación.
3. Los eventos nuevos están documentados, son retrocompatibles y alimentan el único Event Inspector y Presentation Mode.
4. Las vistas Developer, Execution Plan, Internals y comparación se sincronizan por un único índice de timeline por track.
5. Las métricas muestran origen, alcance y limitación; no hay tiempos, estadísticas o decisiones Oracle inventadas.
6. Capítulo 15, catálogo, rutas, historial y progreso funcionan sin romper 01–14.
7. Las pruebas unitarias, integración, accesibilidad/reduced motion, responsive, temas, seguridad y GitHub Pages han pasado o las limitaciones están documentadas explícitamente.
8. La documentación técnica y el handoff diferencian simulación educativa, comportamiento documentado y observación real.

El estado de Sprint 8 queda **implementado y validado localmente**; su publicación continúa pendiente de aprobación.
