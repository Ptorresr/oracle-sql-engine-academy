# Sprint 8 — Escenarios educativos de rendimiento

**Estado:** catálogo fundacional implementado en `content/performance-scenarios.js`. Sprint 8.2 consume sus tres escenarios mediante Buffer Cache & I/O, Sprint 8.3 añade `workareaModel`, Sprint 8.4 añade `optimizerModel`, Sprint 8.5 reutiliza los tres ejemplos declarativos de AI SQL Intelligence y Sprint 8.6 añade `whatIfModel`. Sprint 8.7 integra los cinco laboratorios en el capítulo 15, sus rutas directas, progreso local y Presentation Mode; los cambios siguen locales, pendientes de publicación.
**Regla transversal:** todo SQL es material de referencia y no se ejecuta desde GitHub Pages. Las filas, bloques, estadísticas y umbrales descritos son sintéticos y se etiquetan como educativos.

## Convenciones del modelo de escenarios

Cada escenario propuesto tendrá, como mínimo, la siguiente información declarativa:

| Campo | Propósito |
| --- | --- |
| `id`, `version`, `label` | Identidad estable para pruebas y progreso; sin datos personales. |
| `learningObjectives` | Responde qué es, cómo funciona, para qué sirve e internals conceptuales. |
| `sql` | Consulta de referencia formateada y no ejecutable. |
| `tables`, `rows`, `blocks` | Datos sintéticos y distribución conceptual visibles en Developer/Internals. |
| `statisticsModel` | Entradas educativas de filas, selectividad, distribución e índices; no estadísticas reales. |
| `memoryModel`, `cacheModel` | Límites explícitos del modelo y sus unidades educativas. |
| `expectedObservation` | Resultado lógico o hecho que la simulación debe explicar. |
| `assumptions`, `limitations` | Fronteras visibles del caso. |
| `seed` | Semilla fija solo si se genera una secuencia; de lo contrario, datos totalmente declarados. |

Los escenarios no deben incluir contraseñas, credenciales, SQL DDL destructivo, datos de clientes ni llamadas de red. Una variante What-If se creará mediante copia aislada de parámetros y nunca mutará el escenario base.

## Dataset común propuesto

Los cinco laboratorios usarán dominios coherentes, no necesariamente las mismas filas exactas:

| Dominio | Tablas sintéticas | Intención educativa |
| --- | --- | --- |
| Retail | `customers`, `orders`, `products`, `order_items` | Reutilización de producto, filtros selectivos y JOIN de pedidos. |
| Finanzas | `accounts`, `ledger_entries`, `settlement_events` | Conciliación, repetición de búsquedas y protección de datos. |
| Data Warehouse | `fact_sales`, `dim_date`, `dim_store`, `dim_product` | Volumen conceptual, selectividad variable, sort/hash y posible TEMP educativo. |

Los IDs de fila y bloque serán sintéticos, por ejemplo `ORD-01` y `ORDERS-B01`. Un bloque es una unidad visual del escenario, no una afirmación sobre tamaño de bloque, placement físico o formato de Oracle.

## Laboratorio 1 — Buffer Cache & I/O

**Implementación 8.2:** los tres casos se consumen con cache fría o caliente, una capacidad normalizada y patrones declarados, secuenciales o reutilizados. La regla FIFO se declara en el motor educativo; no intenta reproducir un algoritmo real de Buffer Cache. Cada solicitud mantiene separadas la petición lógica, el hit/miss conceptual, la entrega de filas y el conteo ilustrativo de lecturas físicas conceptuales.

### Preguntas educativas

- **¿Qué es?** Una representación de bloques y una caché conceptual para razonar sobre reutilización.
- **¿Cómo funciona?** El modelo recibe solicitudes de bloque, consulta el conjunto local de bloques residentes y emite hit o miss de forma determinista.
- **¿Para qué sirve?** Ayuda a diferenciar una solicitud lógica, el acceso a datos y un posible I/O conceptual.
- **¿Qué sucede internamente?** El diagrama vincula datafiles educativos, Buffer Cache conceptual y el SQL Execution Engine.
- **Developer / DBA:** Developer revisa acceso y predicado de referencia; DBA revisa patrón, reutilización y el alcance ilustrativo de las métricas.

### Caso 1 — Retail: catálogo caliente de productos

| Elemento | Diseño propuesto |
| --- | --- |
| Objetivo | Mostrar reutilización de los mismos bloques de `products` al consultar pedidos recientes. |
| SQL de referencia | `SELECT p.product_name, oi.quantity FROM order_items oi JOIN products p ON p.product_id = oi.product_id WHERE oi.order_date >= :cutoff_date;` |
| Datos / patrón | Secuencia declarada `PRODUCTS-B01`, `PRODUCTS-B02`, `PRODUCTS-B01`, `PRODUCTS-B01`; cache inicial caliente para `PRODUCTS-B01`. |
| Variables | Capacidad conceptual, patrón repetido y estado frío/caliente. |
| Observación esperada | Reutilizar un bloque puede producir hits en el modelo; las filas devueltas no cambian por el estado de caché. |
| Limitación | No afirma qué bloques serían calientes en producción ni cuantifica latencia. |

### Caso 2 — Finanzas: conciliación con accesos dispersos

| Elemento | Diseño propuesto |
| --- | --- |
| Objetivo | Contrastar una secuencia de bloques con poca reutilización frente a una secuencia repetida. |
| SQL de referencia | `SELECT l.entry_id, s.settlement_id FROM ledger_entries l JOIN settlement_events s ON s.reference_id = l.reference_id WHERE l.posted_on = :posting_date;` |
| Datos / patrón | Solicitudes a `LEDGER-B01`, `SETTLE-B04`, `LEDGER-B07`, `SETTLE-B02` y variante con referencias repetidas. |
| Variables | Número de bloques, patrón secuencial/aleatorio/repetido y capacidad educativa. |
| Observación esperada | Los misses aumentan en la secuencia declarada cuando el modelo no puede reutilizar bloques; esto no diagnostica un problema real. |
| Limitación | No modela índices, multiblock read, concurrencia, prefetch ni sustitución real de buffers. |

### Caso 3 — Data Warehouse: exploración de ventas por período

| Elemento | Diseño propuesto |
| --- | --- |
| Objetivo | Mostrar que un acceso amplio puede solicitar varios bloques y que las solicitudes lógicas no son equivalentes a I/O físico real. |
| SQL de referencia | `SELECT d.calendar_month, SUM(f.net_amount) FROM fact_sales f JOIN dim_date d ON d.date_id = f.date_id WHERE d.calendar_year = :year GROUP BY d.calendar_month;` |
| Datos / patrón | Secuencia amplia de bloques de `FACT-SALES-Bxx`, con una variante de cache fría y otra con parte del conjunto residente. |
| Variables | Cantidad de bloques solicitados, capacidad, reutilización y estado de cache conceptual. |
| Observación esperada | El panel distingue conteo de solicitudes lógicas y misses del modelo sin convertirlos en rendimiento medido. |
| Limitación | No afirma que un full scan sea incorrecto ni modela almacenamiento real. |

## Laboratorio 2 — PGA, Work Areas & TEMP

**Implementación 8.3:** cada escenario declara `workareaModel` con operación, filas, unidades de fila, presupuesto, distribución y clasificación esperada del modelo. Retail inicia HASH JOIN agrupado con 4 × 2 unidades y presupuesto 16 (`Optimal`); Finanzas inicia SORT mixto con 12 × 2 y presupuesto 16 (`One-Pass`); Data Warehouse inicia HASH JOIN amplio con 30 × 3 y presupuesto 12 (`Multi-Pass`). Estos perfiles seleccionan valores educativos al cambiar de escenario y no modifican los datos SQL, filas ni bloques de origen.

### Preguntas educativas

- **¿Qué es?** Una workarea es la representación educativa del espacio de trabajo privado del operador; no es Buffer Cache.
- **¿Cómo funciona?** El motor compara unidades de filas/tamaño con un límite declarado y emite fases conceptuales de procesamiento.
- **¿Para qué sirve?** Ayuda a entender por qué el tamaño de entrada y el límite de trabajo cambian la hipótesis del modelo.
- **¿Qué sucede internamente?** HASH JOIN y SORT se visualizan con una workarea y TEMP solamente ante la regla declarada.
- **Developer / DBA:** Developer compara forma de consulta y volumen; DBA revisa la evidencia disponible y evita inferir TEMP sin ella.

### Caso 1 — Retail: HASH JOIN contenido en la workarea

| Elemento | Diseño propuesto |
| --- | --- |
| Objetivo | Conectar el HASH JOIN existente con una workarea suficientemente amplia del escenario. |
| SQL de referencia | `SELECT c.customer_id, o.order_id FROM customers c JOIN orders o ON o.customer_id = c.customer_id WHERE o.order_date >= :cutoff_date;` |
| Datos / parámetros | Pocas filas build, tamaño educativo fijo, límite de workarea mayor que las unidades requeridas. |
| Variables | Filas procesadas, tamaño estimado de fila, límite y algoritmo. |
| Observación esperada | Se muestran asignación y procesamiento sin emitir eventos TEMP en la variante base. |
| Limitación | No afirma que Oracle siempre mantenga una unión de este tipo enteramente en memoria. |

### Caso 2 — Finanzas: ordenación de conciliación

| Elemento | Diseño propuesto |
| --- | --- |
| Objetivo | Explicar que un SORT conceptual puede requerir una workarea sin tratar el operador como fallo. |
| SQL de referencia | `SELECT account_id, posted_on, amount FROM ledger_entries WHERE posted_on BETWEEN :from_date AND :to_date ORDER BY account_id, posted_on;` |
| Datos / parámetros | Filas con duplicados de cuenta/fecha, SORT mixto y una capacidad educativa que produce una pasada temporal declarada. |
| Variables | Volumen, bytes estimados por fila, límite y distribución. |
| Observación esperada | El inspector explica por qué la ordenación aparece en el escenario, qué unidades del modelo se consumen y los pares `TEMP_WRITE`/`TEMP_READ` educativos. |
| Limitación | No se presentan fases ni límites como estadísticas reales de memoria o TEMP. |

### Caso 3 — Data Warehouse: volumen y spill educativo

| Elemento | Diseño propuesto |
| --- | --- |
| Objetivo | Mostrar una condición declarada donde el modelo particiona/escribe TEMP de manera explícita. |
| SQL de referencia | `SELECT p.category, SUM(f.net_amount) FROM fact_sales f JOIN dim_product p ON p.product_id = f.product_id GROUP BY p.category;` |
| Datos / parámetros | Entrada con unidades de trabajo superiores al límite educativo y particiones predefinidas. |
| Variables | Filas, tamaño, memoria, método HASH/SORT y distribución. |
| Observación esperada | Los pares `TEMP_WRITE`/`TEMP_READ` aparecen únicamente después del umbral del modelo; la clasificación local inicia Multi-Pass. |
| Limitación | No reproduce one-pass/multi-pass reales, segmentación, I/O ni criterios de Oracle; no todo HASH JOIN usa TEMP. |

## Laboratorio 3 — Optimizer & Cardinality

**Implementación 8.4:** cada escenario declara `optimizerModel` con filas base, selectividad, calidad de estadísticas, índice, distribución, observación declarada opcional, resultado lógico y tratamiento explícito de NULL. Retail inicia con 1,000 × 2% y un índice educativo; Finanzas inicia con estadísticas desactualizadas, distribución sesgada y tres filas lógicas declaradas para ilustrar duplicados; Data Warehouse inicia con 1,000,000 × 75% y Hash Join educativo, pero puede mostrar Sort Merge solo bajo la regla uniforme/documentada. Ninguno de estos perfiles modifica SQL, tablas, bloques ni datos sintéticos de origen.

### Preguntas educativas

- **¿Qué es?** Un modelo de estimación local para explorar filas esperadas, selectividad e hipótesis de acceso.
- **¿Cómo funciona?** Reglas documentadas transforman las entradas declaradas en estimaciones y alternativas educativas.
- **¿Para qué sirve?** Permite comparar un predicado selectivo, otro no selectivo y estadísticas conceptualmente deficientes.
- **¿Qué sucede internamente?** La visualización separa estadísticas de objeto, estimación y observación si existe.
- **Developer / DBA:** Developer puede vincular predicados e índices hipotéticos; DBA puede revisar sesgo de estimación y evidencia disponible sin afirmar causalidad.

### Caso 1 — Retail: filtro selectivo con índice conceptual

| Elemento | Diseño propuesto |
| --- | --- |
| Objetivo | Contrastar selectividad declarada baja con una alternativa de acceso por índice conceptual. |
| SQL de referencia | `SELECT order_id, customer_id, order_total FROM orders WHERE order_id = :order_id;` |
| Datos / estadísticas | Muchas filas base, selectividad declarada baja, índice conceptual disponible. |
| Variables | Filas, selectividad, disponibilidad de índice y distribución. |
| Observación esperada | La regla explícita puede seleccionar una ruta por índice educativa; el inspector expone las entradas usadas. |
| Limitación | El CBO real puede tomar otra decisión según versión, estadísticas, binds, costes y contexto. |

### Caso 2 — Finanzas: estimación con distribución sesgada

| Elemento | Diseño propuesto |
| --- | --- |
| Objetivo | Mostrar la diferencia entre selectividad uniforme supuesta y observación simulada declarada para una cuenta frecuente. |
| SQL de referencia | `SELECT entry_id, amount FROM ledger_entries WHERE account_id = :account_id AND posted_on >= :from_date;` |
| Datos / estadísticas | Distribución conceptual sesgada; variante con estadística uniforme y otra con estadística representativa. |
| Variables | Distribución, filas, selectividad y calidad de estadísticas conceptual. |
| Observación esperada | El laboratorio muestra estimación y observación del escenario por separado y marca cualquier diferencia como explicación educativa. |
| Limitación | La observación solo existe porque el escenario la declara; no es `A-Rows` de Oracle ni diagnóstico de producción. |

### Caso 3 — Data Warehouse: join amplio y alternativas de método

| Elemento | Diseño propuesto |
| --- | --- |
| Objetivo | Explorar cómo tamaño relativo y selectividad declarados pueden cambiar una recomendación educativa de método de JOIN. |
| SQL de referencia | `SELECT d.calendar_month, SUM(f.net_amount) FROM fact_sales f JOIN dim_date d ON d.date_id = f.date_id WHERE d.calendar_year = :year GROUP BY d.calendar_month;` |
| Datos / estadísticas | Fact grande conceptual, dimensión pequeña, filtros de alta/baja selectividad y variantes de índice. |
| Variables | Cardinalidad, relaciones, índices, selectividad y distribución. |
| Observación esperada | El Plan compara alternativas como hipótesis y enlaza con HASH/NESTED/MERGE del Comparison Lab si la consulta es equivalente. |
| Limitación | No calcula Cost real ni presenta un método como universalmente mejor. |

## Laboratorio 4 — Execution Plan Diagnostics

**Implementación 8.5:** `content/sql-intelligence-examples.js` declara Retail como `DISPLAY` estimado sin A-Rows ni Starts; Finanzas conserva `DISPLAY_CURSOR` con Starts superiores a uno; y Data Warehouse conserva columnas opcionales, incluidos memoria y `TempSpc` solamente cuando el texto los aporta. El timeline diagnóstico no modifica estos textos ni los datos que el parser conserva.

### Preguntas educativas

- **¿Qué es?** Una extensión de AI SQL Intelligence para leer la evidencia textual disponible en `DBMS_XPLAN`.
- **¿Cómo funciona?** El parser reconoce la tabla con `Id` y `Operation`, conserva columnas, nodos, predicados y notas; el analyzer deriva hallazgos prudentes.
- **¿Para qué sirve?** Facilita recorrer operadores y distinguir un plan estimado de uno con estadísticas observadas.
- **¿Qué sucede internamente?** No ejecuta SQL: representa el texto importado y las relaciones que pudo reconocer con seguridad.
- **Developer / DBA:** Developer revisa SQL/predicados; DBA interpreta `E-Rows`, `A-Rows`, `Starts`, `Buffers`, `Reads`, `A-Time`, Cost y TempSpc solo cuando estén presentes.

### Campos realmente soportados por el parser actual

| Área | Soporte actual verificado |
| --- | --- |
| Entrada | Texto de hasta 200.000 caracteres, normalizado a saltos de línea. |
| Tabla | Requiere encabezados `Id` y `Operation`; detecta columnas variables delimitadas por `|`. |
| Jerarquía | Se deriva de la indentación de `Operation`; varios nodos raíz o entradas incompletas producen advertencia. |
| Operadores | Operaciones desconocidas se conservan como texto si tienen identificador. |
| Identificadores | Reconoce el indicador `*` y lo conserva como `predicateMarker`. |
| Métricas | `Starts`, `E-Rows`, `A-Rows`, `Rows`, `Cost`, `Bytes`, `A-Time`, `Buffers`, `Reads`, `Writes`, `OMem`, `1Mem`, `Used-Mem`, `TempSpc` y columnas extra conservadas como texto. |
| Predicados / notas | Asocia predicados solo a IDs reconocidos y conserva notas; advierte si no puede asociar algo. |
| Ausencias | Permanecen `null`; el formato `DISPLAY` no se vende como plan con observación. |

### Caso 1 — Retail: `EXPLAIN PLAN` estimado

| Elemento | Diseño propuesto |
| --- | --- |
| Objetivo | Importar un plan tipo `DISPLAY` sin `A-Rows` y explicar las estimaciones presentes. |
| SQL de referencia | `SELECT o.order_id, c.customer_name FROM orders o JOIN customers c ON c.customer_id = o.customer_id WHERE o.order_date >= :cutoff_date;` |
| Evidencia | E-Rows, Cost, objetos y predicado solo si los aporta el texto de ejemplo. |
| Observación esperada | El lab etiqueta el plan como estimado y evita cualquier panel de “filas reales” inventadas. |
| Limitación | Cost no se representa como duración; el plan no prueba ejecución. |

### Caso 2 — Finanzas: `DISPLAY_CURSOR` con `Starts`

| Elemento | Diseño propuesto |
| --- | --- |
| Objetivo | Explicar que `A-Rows/Starts` es un cálculo derivado condicionado y no una equivalencia universal. |
| SQL de referencia | `SELECT l.entry_id, s.settlement_id FROM ledger_entries l JOIN settlement_events s ON s.reference_id = l.reference_id WHERE l.account_id = :account_id;` |
| Evidencia | Plan de ejemplo con `Starts > 1`, E-Rows y A-Rows textuales. |
| Observación esperada | El analyzer muestra valores originales, fórmula derivada y limitación de alcance. |
| Limitación | No atribuye `Starts` elevado a un problema ni concluye una causa desde una diferencia aislada. |

### Caso 3 — Data Warehouse: plan con sort/hash y columnas opcionales

| Elemento | Diseño propuesto |
| --- | --- |
| Objetivo | Recorrer operadores de agregación/ordenación/hash con `Buffers`, `Reads`, `A-Time` o `TempSpc` solo si el texto los contiene. |
| SQL de referencia | `SELECT p.category, SUM(f.net_amount) FROM fact_sales f JOIN dim_product p ON p.product_id = f.product_id GROUP BY p.category ORDER BY p.category;` |
| Evidencia | Plan de ejemplo con columnas opcionales y una nota/predicado. |
| Observación esperada | El inspector distingue evidencia importada, interpretación y posibles comprobaciones; TEMP se cita solo si `TempSpc` está presente. |
| Limitación | El nombre `SORT`/`HASH` no prueba fallo ni uso de TEMP; valores ausentes no se completan. |

## Laboratorio 5 — Performance What-If Lab

**Implementación 8.6:** cada escenario incorpora `whatIfModel` inmutable con parámetros permitidos, valores iniciales, restricciones, identidad de población/resultado y reglas de comparabilidad. Retail conserva la identidad lógica declarada al variar selectividad/índice; Finanzas la conserva al variar cache/workarea; Data Warehouse solo la declara comparable cuando población y volumen coinciden. La igualdad de cardinalidad nunca establece equivalencia por sí sola.

### Preguntas educativas

- **¿Qué es?** Comparador local de hipótesis A/B sobre un escenario común.
- **¿Cómo funciona?** Se guarda un snapshot base, se modifica una variable declarada y se construye un segundo timeline independiente.
- **¿Para qué sirve?** Relaciona cardinalidad, acceso, cache y workarea sin presentar tiempos inventados.
- **¿Qué sucede internamente?** Reutiliza motores de rendimiento y el patrón de tracks del Comparison Lab; no ejecuta ni explica internals físicos reales.
- **Developer / DBA:** Developer revisa la forma de consulta/datos; DBA ve evidencia, supuestos, diferencias y acciones de validación posibles.

### Caso 1 — Retail: selectividad y acceso conceptual

| Elemento | Diseño propuesto |
| --- | --- |
| Baseline A | Consulta de pedidos recientes con selectividad declarada media e índice conceptual no disponible. |
| Variante B | Misma consulta/dataset con selectividad baja e índice conceptual disponible. |
| Comparación | Cardinalidad estimada del modelo, `ACCESS_PATH_SELECTED` educativo, bloques solicitados y resultados lógicos equivalentes cuando el filtro representa la misma población. |
| Límite | No afirma que crear un índice cambie automáticamente un plan real ni estima tiempo. |

### Caso 2 — Finanzas: repetición y memoria de trabajo

| Elemento | Diseño propuesto |
| --- | --- |
| Baseline A | Conciliación con patrón disperso y límite de workarea reducido. |
| Variante B | Mismo dataset con patrón más reutilizable o mayor límite educativo. |
| Comparación | Hits/misses del modelo, unidades de workarea y eventos TEMP solo si se dan las reglas del escenario. |
| Límite | No deduce configuración PGA ni I/O real; las variantes son hipótesis separadas. |

### Caso 3 — Data Warehouse: volumen y alternativa de JOIN

| Elemento | Diseño propuesto |
| --- | --- |
| Baseline A | Fact grande conceptual, filtro poco selectivo y algoritmo HASH seleccionado para exploración. |
| Variante B | Volumen/filtro/distribución modificados y una alternativa NESTED/MERGE evaluada. |
| Comparación | Operadores, resultados canónicos, filas/modelo, solicitudes de bloque, workarea ilustrativa y posibles eventos TEMP. |
| Límite | La equivalencia de salida se prueba sobre los datos sintéticos; no se compara duración ni se declara ganador universal. |

## Reglas de contenido y seguridad

- Todo caso debe contener definición, mecanismo, propósito, internals conceptuales, implicación de rendimiento, perspectiva Developer, perspectiva DBA y tres casos de uso claramente distintos.
- Las reglas locales deben indicar sus entradas y no llamarse IA generativa ni predicción del optimizador.
- SQL relacionado debe enlazarse con cláusulas semánticas (`FROM`, `JOIN`, `ON`, `WHERE`, `GROUP BY`, `ORDER BY`) y declarar cuando un evento físico/conceptual no está forzado por una cláusula.
- El Event Inspector debe mostrar filas, bloques, operador y datos solo si el escenario los representa; no debe inventar referencias vacías.
- Ejemplos importados de plan son texto no confiable: se escapan antes de renderizar y nunca se ejecutan como HTML o SQL.
- Las rutas y recursos deben ser relativos/locales para GitHub Pages. No se incorporan credenciales, servicios externos, CDN en runtime ni dependencias nuevas.

## Integración RunBook y criterio de cierre local

Los cinco escenarios se exponen en el capítulo 15 **Database Internals & Performance** sin alterar los capítulos 01–14. Las rutas `#buffer-cache-io`, `#pga-workareas-temp`, `#optimizer-cardinality`, `#execution-plan-diagnostics` y `#performance-what-if` conservan cada laboratorio y su timeline existente. La ruta diagnóstica delega en AI SQL Intelligence: no duplica contenido importado, parser, analyzer ni eventos.

El progreso local solo se completa tras una interacción educativa válida: inspeccionar un paso de Buffer Cache, comparar una configuración de Workarea, revisar una regla de Cardinalidad, seleccionar un operador diagnóstico y revisar una comparación What-If. La apertura de una ruta registra visita, no finalización. Estas reglas siguen separando escenarios didácticos deterministas de ejecución, telemetría o recomendaciones reales de Oracle.
