# Evaluación técnica — Anatomy

**Fecha de revisión:** 2026-11-04
**Estado:** aprobado como referencia de diseño; no instalado ni incorporado como dependencia.

## Qué es

[Anatomy](https://github.com/wheresryan22/anatomy) es una Agent Skill para construir figuras técnicas isométricas e interactivas. Produce SVG como base y permite capas WebGL y efectos 3D opcionales. Su propia documentación declara compatibilidad con Codex, usa el formato de Agent Skills y ofrece instalación por proyecto en `.agents/skills/anatomy`.

## Resultado de la revisión

| Criterio | Hallazgo | Decisión |
| --- | --- | --- |
| Licencia | MIT; conservar aviso de copyright y licencia si se reutiliza una parte sustancial. | Compatible, con atribución. |
| Dependencias | El upstream declara Node.js 20.10+; el kit central usa módulos nativos. Las comprobaciones visuales requieren Chrome/Chromium. | No añadir al runtime de GitHub Pages. |
| Compatibilidad | La Skill documenta Codex y la ruta `.agents/skills/anatomy`. | Compatible con el flujo previsto. |
| Rendimiento | SVG es la base; WebGL y modo 3D son opcionales. El upstream identifica que las figuras densas pueden degradarse notablemente en perfil móvil. | Usar SVG ligero por defecto; WebGL solo si aporta valor educativo. |
| Seguridad | Incluye scripts de build, auditoría y captura de navegador. | No ejecutar ni vendorizar hasta revisar los archivos concretos y sus dependencias. |
| Adecuación | Su modelo de figura física, lecturas vivas y controles es útil para explicar cache, bloques, workareas y operadores. | Adoptar principios visuales, no copiar una metáfora sin validación didáctica. |

## Evidencia revisada

- El manifiesto `SKILL.md` upstream declara licencia MIT, compatibilidad con Codex y requisitos de Node/Chrome.
- El README indica que el kit puede generar SVG independiente y que los ejemplos se construyen con scripts Node.
- Se revisó el inicio de `kit/iso-kit.mjs`: es un módulo ESM de proyección isométrica y geometría; no se ejecutó.
- Se revisaron las instrucciones del workflow: exigen una fuente de verdad para números y comportamiento, controles de teclado/movimiento reducido y auditorías/capturas para figuras complejas.

## Plan de adopción propuesto

1. En Sprint 1, usar Anatomy solo como guía: figuras SVG accesibles, leyendas, estado visible y movimiento reducido.
2. Antes de instalarlo, fijar un commit o release de upstream, revisar el árbol de scripts que se vaya a usar y verificar Node/Chrome locales.
3. Si se instala para el proyecto, usar `.agents/skills/anatomy` y revisar el diff antes de aceptar actualizaciones. No copiar sus ejemplos ni activos sin respetar la licencia.
4. Para una primera figura, elegir un concepto acotado — por ejemplo, cache hit/miss o HASH BUILD/PROBE — y publicar SVG sin WebGL; validar móvil, teclado y modo reducido.
5. No ejecutar los scripts de auditoría/captura hasta tener aprobación para sus requisitos de navegador y después de revisar su contenido.

## Conclusión

Anatomy encaja como herramienta de diseño y potencial Skill de autoría, no como librería obligatoria de producción. Para esta academia, el beneficio principal es su disciplina: modelo coherente, visualización con lectura viva y verificación. La integración debe ser gradual, versionada y optativa para que el sitio continúe siendo ligero y estable en GitHub Pages.
