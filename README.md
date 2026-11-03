# Oracle SQL & AI Database Engine Academy

Proyecto educativo estático para GitHub Pages: SQL avanzado, arquitectura del motor Oracle, simulaciones y laboratorios de IA.

## Estado
**Scaffold inicial** con una demo HTML preexistente en `index.html`. El motor Anatomy, las animaciones físicas de bloques y la IA generativa real **aún no están integrados**. Los módulos de IA presentes en la demo son simulaciones/reglas locales, no llamadas a un LLM.

## Publicación en GitHub Pages
1. Crea un repositorio nuevo y sube los archivos a `main`.
2. En Settings > Pages selecciona Deploy from a branch, `main`, `/ (root)`.
3. Abre `https://TU_USUARIO.github.io/NOMBRE_REPO/`.
4. No incluyas credenciales, conexiones SQLcl ni claves de API en el repositorio.

## Trabajo recomendado
Usa **Codex** para implementar y probar el repositorio (código, animaciones, pruebas, Git). Usa **ChatGPT** para definir experiencias didácticas, casos de uso, contenido, revisión conceptual y criterios de aceptación. Mantén las decisiones en `docs/`.

## Próximos hitos
- M1: Layout estilo OCI PoC RunBook + sistema de diseño y navegación.
- M2: Simulador HASH JOIN con timeline, Play/Pause/Step, vistas Developer/DBA/Internals y métricas marcadas como ficticias.
- M3: NESTED LOOPS, SORT MERGE y comparación con HASH JOIN.
- M4: Laboratorios AI Vector Search, Select AI y RAG simulados.
- M5: importador de planes DBMS_XPLAN y visualización con datos reales suministrados por el usuario.
- M6: pruebas, accesibilidad, rendimiento y despliegue continuo.

Ver `docs/PROJECT_BRIEF.md`, `docs/ARCHITECTURE.md`, `docs/BACKLOG.md`.
