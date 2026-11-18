(() => {
  "use strict";

  const build = (architecture, components) => {
    const catalog = new Map(components.map((component) => [component.id, component]));
    const componentIds = [...new Set(architecture.nodes.map((node) => node.componentId))];
    const required = componentIds.map((id) => catalog.get(id)).filter(Boolean).filter((component) => component.deployable);
    const capabilities = componentIds.map((id) => catalog.get(id)).filter(Boolean).filter((component) => !component.deployable);
    const prerequisites = [
      "Definir tenancy, región, compartimentos e identidades según las políticas de la organización.",
      "Revisar redes, conectividad y controles de datos para cada servicio realmente elegido.",
      "Configurar privilegios, secretos y proveedores conforme a la documentación del servicio y la versión usada.",
      "Validar costos, cuotas, residencia de datos, observabilidad y recuperación antes del despliegue."
    ];
    return Object.freeze({
      architectureId: architecture.id,
      required: Object.freeze(required.map((component) => Object.freeze({ id: component.id, label: component.label, responsibility: component.responsibility }))),
      capabilities: Object.freeze(capabilities.map((component) => Object.freeze({ id: component.id, label: component.label, note: "Capacidad conceptual; no se despliega como servicio independiente." }))),
      prerequisites: Object.freeze(prerequisites),
      limitations: "Guía educativa. No genera Terraform, políticas IAM, subnets, secretos, presupuestos ni una topología operable."
    });
  };

  globalThis.OracleArchitectureDeploymentGuide = Object.freeze({ build });
})();
