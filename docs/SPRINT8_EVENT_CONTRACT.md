# Sprint 8 — Performance Event Contract

**Estado:** contrato base implementado por `simulation/performance-event-adapter.js`; Sprint 8.2 usa tipos existentes para Buffer Cache & I/O y el snapshot opcional `cacheState`. Sprint 8.3 implementa el snapshot opcional `workareaState`; Sprint 8.4 implementa cardinalidad; Sprint 8.5 implementa `PLAN_OPERATOR_START` y `PLAN_OPERATOR_END`; y Sprint 8.7 integra los timelines existentes sin añadir campos ni tipos obligatorios.
**Propósito:** ampliar las simulaciones de rendimiento sin romper los timelines existentes, Event Inspector, Animated 3D Data Flow ni Presentation Mode.

## Implementación actual verificada

Los motores `OracleHashJoinEngine` y `OracleJoinComparisonEngine` emiten actualmente objetos inmutables con estos campos base:

```js
{
  step,
  type,
  source,
  target,
  rowIds,
  blockIds,
  label,
  explanation,
  illustrativeMetrics,
  // detalles opcionales específicos, por ejemplo matches o result
}
```

`OracleAnimatedDataFlow.EVENT_CONTRACT` exige los ocho campos siguientes:

```js
["step", "type", "source", "target", "rowIds", "blockIds", "label", "illustrativeMetrics"]
```

Los laboratorios de AI pueden añadir `explanation`, `executionLocation` y `representation`. Los nuevos eventos de rendimiento deben conservar los campos base, no cambiar su tipo y tratar todos los campos adicionales como opcionales. Los consumidores existentes deben poder recibir un evento de Sprint 2/3 sin los nuevos campos.

## Reglas de compatibilidad

1. `step` comienza en `1`, aumenta una vez por evento y no se reutiliza dentro de un timeline.
2. `rowIds` y `blockIds` son arrays inmutables; se usan arrays vacíos cuando el evento no representa filas o bloques.
3. `source`, `target` y `label` son texto educativo visible, no identificadores de internals reales ni evidencia de una traza física.
4. `illustrativeMetrics` es una instantánea inmutable del estado del modelo en ese paso. Un valor ausente no se reemplaza por `0` salvo que el propio escenario defina cero como valor de entrada.
5. `explanation` puede ser texto (motores de JOIN actuales) u objeto estructurado (otros laboratorios), pero el adaptador nuevo normalizará la forma elegida antes de enviarla a su inspector. No se debe exigir una forma nueva a consumidores históricos.
6. Campos opcionales nuevos no pueden cambiar el significado de un evento existente, especialmente `READ_BLOCK`, `CACHE_HIT`, `CACHE_MISS` y `SPILL_TEMP`.
7. Las métricas importadas del plan conservan su texto y origen; el adaptador no inventa `A-Rows`, `Buffers`, `Reads`, `A-Time`, `Starts` ni `TempSpc`.
8. Los renderers nunca deciden ni completan eventos; solo representan la secuencia recibida y comunican la selección a la UI.

## Forma aplicada por Sprint 8.3

La siguiente forma se usa en los eventos nuevos del motor `OracleWorkareaTempEngine`. No añade ni exige campos nuevos a los motores históricos.

```js
{
  // contrato base obligatorio
  step: 1,
  type: "WORKAREA_ALLOCATE",
  source: "SQL Operation",
  target: "PGA / Work Area",
  rowIds: Object.freeze(["ORD-01"]),
  blockIds: Object.freeze(["ORDERS-B01"]),
  label: "El modelo reserva una workarea educativa para el operador.",
  illustrativeMetrics: Object.freeze({
    illustrative: true,
    estimatedWorkUnits: 7,
    memoryBudgetUnits: 16,
    temporaryPasses: 0
  }),

  // extensiones opcionales de Sprint 8
  scenarioId: "retail-order-fulfillment",
  operatorId: "op-hash-join-workarea",
  workareaId: "pga-workarea-educational",
  executionLocation: "EDUCATIONAL_ABSTRACTION",
  representation: "workarea-temp",
  explanation: Object.freeze({
    what: "Reserva conceptual de memoria de trabajo.",
    where: "PGA Workarea educativa.",
    how: "El motor compara unidades declaradas por el escenario.",
    why: "Permite explicar presión de memoria sin medir PGA real.",
    dba: "Validar el alcance y la evidencia antes de extrapolar a producción."
  }),
  decisionBasis: Object.freeze(["rows", "rowUnits", "memoryBudgetUnits", "operationFactor", "distributionFactor"]),
  workareaState: Object.freeze({
    memoryBudgetUnits: 16,
    estimatedWorkUnits: 7,
    workareaUsedUnits: 0,
    temporaryPasses: 0,
    currentPhase: 0,
    classification: "OPTIMAL",
    tempActive: false
  })
}
```

### Campos opcionales compatibles

| Campo | Uso | Regla |
| --- | --- | --- |
| `scenarioId` | Relaciona evento con escenario declarativo. | Estable, no debe ser un nombre de usuario ni dato sensible. |
| `operatorId` | Correlaciona un evento con operador conceptual o nodo parseado. | Solo apunta a un ID existente; no implica que sea un operador observado. |
| `workareaId` | Distingue workareas didácticas dentro del modelo. | No se usa para afirmar un identificador de sesión Oracle. |
| `executionLocation` | Expresa el límite del modelo, por ejemplo `EDUCATIONAL_ABSTRACTION`. | Nunca representa ubicación observada de una instancia. |
| `representation` | Ayuda a elegir aliases/anchors visuales. | Semántico y estable; no contiene HTML. |
| `decisionBasis` | Lista de entradas o reglas que justifican una hipótesis. | Explica el modelo local, no causalidad en Oracle. |
| `explanation` | Contenido del Event Inspector. | Debe separar qué ocurre, dónde, cómo, para qué y perspectiva DBA. |
| `cacheState` | Snapshot de la caché conceptual en el paso. | Incluye `residentBlockIds` y `capacityBlocks` positivos; no representa buffers reales ni una política observada. |
| `workareaState` | Snapshot de presupuesto, trabajo, fase, clasificación y estado TEMP educativo. | Requiere presupuesto positivo, trabajo/pasadas no negativos y clasificación no vacía; no representa PGA, workarea ni TEMP observados. |

La lista exacta de valores de `executionLocation` y `representation` se consolidará en 8.1. Si no añade valor educativo, un evento debe omitirlos.

## Taxonomía existente conservada

| Evento | Emisor actual | Significado educativo | Consumidores actuales | Límite que debe preservarse |
| --- | --- | --- | --- | --- |
| `READ_BLOCK` | HASH JOIN / Comparison engine | Solicitud lógica de bloque. | Timeline, Developer/Internals, Animated Data Flow, Presentation Mode. | No prueba por sí solo una lectura física. |
| `CACHE_HIT` | HASH JOIN engine | El bloque ya estaba en la caché conceptual del escenario. | Inspector e Internals. | No reproduce la administración real de Buffer Cache. |
| `CACHE_MISS` | HASH JOIN engine | El bloque no estaba en la caché conceptual y se incorpora al modelo. | Inspector e Internals. | Puede requerir I/O conceptual; no es una medición física. |
| `TABLE_ACCESS` | HASH JOIN / Comparison engine | Entrega filas lógicas desde una entrada al operador. | Developer, Plan, Internals. | No describe paquetes físicos de filas. |
| `HASH_BUILD` | HASH JOIN / Comparison engine | Inserta filas build en buckets conceptuales. | Plan, Internals, inspector. | No fuerza que Oracle elija HASH JOIN. |
| `HASH_PROBE` | HASH JOIN / Comparison engine | Busca coincidencias por clave en los buckets conceptuales. | Plan, Internals, inspector. | No es una traza interna literal. |
| `EMIT_ROW` | HASH JOIN / Comparison engine | Emite una fila lógica de resultado. | Developer/resultados/equivalencia. | No define orden físico de salida. |
| `SPILL_TEMP` | HASH JOIN engine | Marca una partición para TEMP cuando supera la capacidad didáctica. | Internals, inspector, Animated Flow. | No demuestra uso de TEMP real ni criterio exacto de Oracle. |

Los eventos de Comparison `NESTED_OUTER_ROW`, `INDEX_LOOKUP`, `SORT_INPUT` y `MERGE_ADVANCE` se mantienen sin modificación y podrán alimentar el laboratorio integrador cuando su semántica aplique.

## Eventos adicionales y su estado

Los eventos de workarea/TEMP están implementados por Sprint 8.3. Sprint 8.4 implementa cardinalidad y selección educativa de alternativa con `CARDINALITY_ESTIMATE` y `ACCESS_PATH_SELECTED`; ambos conservan los ocho campos base, `decisionBasis`, explicación estructurada y `illustrativeMetrics`. Sprint 8.5 implementa `PLAN_OPERATOR_START` y `PLAN_OPERATOR_END` para recorrer diagnósticamente nodos ya importados; no convierten el texto del plan en una traza de Oracle.

| Evento | Estado | Laboratorio | Emisor | Relación con eventos existentes | Representación / explicación | Límite educativo |
| --- | --- | --- | --- | --- | --- |
| `WORKAREA_ALLOCATE` | Implementado 8.3 | PGA & TEMP | `OracleWorkareaTempEngine` | Precede `WORKAREA_PROCESS`. | Reserva conceptual en PGA / Work Area. | No equivale a una asignación PGA observada. |
| `WORKAREA_PROCESS` | Implementado 8.3 | PGA & TEMP | `OracleWorkareaTempEngine` | Fase inicial o posterior a TEMP. | Procesa HASH JOIN o SORT con unidades locales. | No es `HASH_BUILD`, `HASH_PROBE` ni `SORT_RUN` de Oracle. |
| `TEMP_WRITE` | Implementado 8.3 | PGA & TEMP | `OracleWorkareaTempEngine` | Solo aparece antes de su `TEMP_READ` del modelo. | Escribe un lote conceptual en TEMP. | No prueba I/O, segmentos ni latencia real. |
| `TEMP_READ` | Implementado 8.3 | PGA & TEMP | `OracleWorkareaTempEngine` | Sigue una escritura temporal previa del mismo timeline. | Recupera un lote conceptual para la siguiente fase. | No modela E/S, segmentación ni política real. |
| `WORKAREA_COMPLETE` | Implementado 8.3 | PGA & TEMP | `OracleWorkareaTempEngine` | Cierra la última fase y expone la clasificación. | Entrega resultado educativo. | No es un diagnóstico Oracle. |
| `CARDINALITY_ESTIMATE` | Implementado 8.4 | Optimizer & Cardinality | `OracleOptimizerCardinalityEngine` | Precede la alternativa educativa. | Expone `ceil(filas base × selectividad declarada)` y el estado de estadísticas. | No es E-Rows, estadística de diccionario ni cálculo del CBO. |
| `ACCESS_PATH_SELECTED` | Implementado 8.4 | Optimizer & Cardinality | `OracleOptimizerCardinalityEngine` | Sigue la estimación; precede muestra lógica. | Expone alternativa de acceso/JOIN y `decisionBasis` local. | No es plan, coste ni decisión del optimizador Oracle. |
| `WORKAREA_GROW` | Candidato | PGA & TEMP | Workarea engine futuro | Sigue una evaluación de capacidad sin TEMP. | Incremento de unidades del modelo. | No describe políticas reales de memoria. |
| `SORT_RUN` | Candidato | PGA & TEMP | Workarea engine futuro | Complementa `SORT_INPUT` sin cambiarlo. | Lote ordenado conceptual. | No implica spill ni coste temporal. |
| `PLAN_OPERATOR_START` | Implementado 8.5 | Diagnostics | `OraclePlanDiagnosticsTimeline` | Corresponde a un nodo parseado y precede su cierre diagnóstico. | Inicio de explicación educativa con `operatorId`. | `DISPLAY` no indica estadísticas observadas ni inicio de ejecución Oracle. |
| `PLAN_OPERATOR_END` | Implementado 8.5 | Diagnostics | `OraclePlanDiagnosticsTimeline` | Sigue el inicio del mismo `operatorId`. | Consolida evidencia, hallazgos y límites locales. | No infiere duración, orden físico ni fin observado. |

`SPILL_TEMP` no se reemplazará retrospectivamente. Cuando sea útil, `TEMP_WRITE` y `TEMP_READ` añadirán detalle a un motor nuevo; el inspector deberá explicar que todos describen fases conceptuales distintas del mismo escenario educativo. Sprint 8.6 no añade tipos ni campos: cada track A/B reutiliza los eventos adaptados de Optimizer, Buffer Cache y Workarea; su identidad y comparabilidad se conservan fuera del evento para no mezclar alcances de métricas.

## Adaptación y consumidores

```text
resultado puro del motor
       │
performance-event-adapter
       ├── normaliza contrato base y campos opcionales
       ├── congela eventos y métricas
       └── valida referencias a escenario / operador / workarea
                │
                ├── UI del laboratorio: índice, selección y controles
                ├── Event Inspector existente: explicación y datos
                ├── renderer SVG: nodos, bloques y estados seleccionados
                ├── OracleAnimatedDataFlow: ruta y paso activo
                └── OraclePresentationMode: mismo timeline y acciones
```

El adaptador no debe serializar HTML ni utilizar `innerHTML` con contenido importado. Los textos importados por `DBMS_XPLAN` siguen pasando por el escape ya aplicado por los renderers de Intelligence.

## Métricas: origen, alcance y ausencia

| Tipo de dato | Ejemplo | Tratamiento |
| --- | --- | --- |
| Entrada del escenario | `cacheCapacityBlocks`, `memoryLimitUnits`, selectividad declarada. | Se etiqueta como parámetro educativo. |
| Métrica ilustrativa derivada | solicitudes lógicas del modelo, unidades de workarea, eventos TEMP del modelo. | Va en `illustrativeMetrics`, con leyenda visible y sin equivalencia automática con Oracle. |
| Valor importado | `E-Rows`, `A-Rows`, `Starts`, `Buffers`, `Reads`, `A-Time`, `Cost`, `TempSpc`. | Conserva texto/ausencia/origen del parser; no se convierte en otra métrica salvo cálculo derivado señalado. |
| Cálculo derivado | `A-Rows / Starts` cuando `Starts > 1`. | Expone fórmula, alcance y limitación; evita división por cero. |

Un `Cost` importado puede aparecer para contextualizar un plan, pero no se transformará en duración. Un `A-Time` ausente permanece ausente. Un `A-Rows` observado no se fabricará desde filas de un escenario distinto.

## Determinismo y reset

Para un mismo `scenario.version`, parámetros normalizados y semilla declarada, el timeline debe ser lógicamente idéntico: mismo orden, pasos, tipos, referencias, explicación y métricas. Se prohíben `Math.random()`, fecha/hora, estado global mutable y temporizadores en los motores.

`stateAt(timeline, index)` debe reconstruir el estado sin alterar el timeline. Play/Pause solo cambia la UI; Previous, Next y Reset mueven el mismo índice. Cambiar de tema, entrar/salir de Presentation Mode o inspeccionar un componente no puede regenerar eventos ni modificar los parámetros.

## Ejemplos conceptuales

### Buffer Cache

```js
{
  step: 2,
  type: "CACHE_MISS",
  source: "Datafile · ORDERS-B02",
  target: "Database Buffer Cache",
  rowIds: [],
  blockIds: ["ORDERS-B02"],
  label: "El bloque no estaba en la caché conceptual del escenario.",
  illustrativeMetrics: { logicalRequests: 1, conceptualPhysicalReads: 1 },
  representation: "cache-miss"
}
```

Este evento explica una transición del modelo. No afirma que una solicitud concreta cause exactamente una operación de disco en una base real.

### Cardinalidad

```js
{
  step: 1,
  type: "CARDINALITY_ESTIMATE",
  source: "Statistics model",
  target: "Access-path decision",
  rowIds: [],
  blockIds: [],
  label: "La regla educativa estima 120 filas tras aplicar selectividad declarada.",
  illustrativeMetrics: { inputRows: 1200, declaredSelectivity: 0.1, estimatedRows: 120 },
  decisionBasis: ["inputRows", "declaredSelectivity"],
  representation: "estimate"
}
```

El evento describe la fórmula del laboratorio, no una cardinalidad calculada por Oracle.

## Pruebas de aceptación del contrato

- Los timelines existentes de HASH JOIN y Comparison pasan sin campos nuevos.
- Cada evento Sprint 8 conserva los ocho campos base y arrays válidos.
- Los eventos implementados de workarea/TEMP se validan con `workareaState`; los candidatos se rechazan o señalan en desarrollo si faltan sus campos obligatorios.
- La misma entrada produce la misma secuencia y `stateAt` no muta eventos ni escenarios.
- El inspector muestra datos, límite y perspectiva DBA para cualquier tipo conocido; los tipos desconocidos no ejecutan contenido.
- Animated Flow y Presentation Mode reciben exactamente el timeline de la UI, sin timers ni líneas de tiempo paralelas.
- Importaciones de plan con estadísticas ausentes, `Starts = 0`, HTML y texto incompleto conservan las protecciones de Sprint 4.

Estos criterios fueron el prerrequisito para crear el adaptador de Sprint 8.1 y siguen siendo obligatorios antes de implementar los motores de cada laboratorio.

## Estado de Sprint 8.1–8.7

`OraclePerformanceEventAdapter` expone `validateEvent`, `adaptEvent`, `validateTimeline` y `adaptTimeline`, además de las listas inmutables de campos/tipos/ubicaciones admitidos. El adaptador acepta eventos existentes sin exigir extensiones y permite advertir, de manera explícita, tipos desconocidos durante una migración.

No genera eventos por sí mismo, no interpreta un plan ni introduce métricas reales. `OracleBufferCacheEngine` es el primer consumidor: usa exclusivamente `READ_BLOCK`, `CACHE_HIT`, `CACHE_MISS` y `TABLE_ACCESS`; cada evento conserva el contrato base, un `cacheState` congelado, explicación estructurada, `executionLocation: "EDUCATIONAL_ABSTRACTION"` y métricas ilustrativas. Su regla FIFO y sus lecturas físicas conceptuales son propiedades declaradas del laboratorio, no afirmaciones sobre Buffer Cache real.

`OracleWorkareaTempEngine` es el segundo consumidor. Emite `WORKAREA_ALLOCATE`, `WORKAREA_PROCESS`, `TEMP_WRITE`, `TEMP_READ` y `WORKAREA_COMPLETE`, todos con `workareaState` congelado y métricas ilustrativas. `TEMP_WRITE`/`TEMP_READ` se emiten solo por la regla local de One-Pass o Multi-Pass; `SPILL_TEMP` no se reinterpreta ni se sustituye en el motor HASH JOIN histórico.

`OracleOptimizerCardinalityEngine` es el tercer consumidor. Emite `CARDINALITY_ESTIMATE`, `ACCESS_PATH_SELECTED`, `TABLE_ACCESS` y `EMIT_ROW`; no amplía el adaptador con snapshots nuevos. `illustrativeMetrics` conserva filas base, selectividad declarada, estimación, estado de estadísticas, índice, distribución, observación declarada/ausente y alternativa educativa. La observación se mantiene `null` si no fue declarada; no se reemplaza por cero ni se atribuye a una ejecución real.

El preview se carga de forma local y secuencial en GitHub Pages mediante `assets/portal.js`. Sprint 8.7 solo registra rutas, progreso y adaptadores UI sobre esos timelines; `academy:performance-activity` es una señal de interfaz para progreso local, no un tipo de evento de simulación ni una extensión del contrato base. No se agregan campos ni tipos al adaptador.
