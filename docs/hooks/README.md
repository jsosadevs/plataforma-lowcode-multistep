# Módulo: Hooks

## 1. Propósito y Funcionalidad

El directorio `src/hooks/` es fundamental para la arquitectura de la aplicación, ya que encapsula la lógica de negocio y la gestión del estado, manteniéndola separada de los componentes de la UI. Este enfoque, alineado con las mejores prácticas de React, hace que el código sea más limpio, reutilizable y fácil de testear.

Los hooks de este módulo se pueden clasificar en dos patrones principales:

1.  **Hooks de Gestión de Estado**: Centrados en manejar el estado de una feature compleja.
2.  **Hooks de Lógica de Negocio**: Centrados en ejecutar operaciones y lógica de negocio.

## 2. Hooks Notables y sus Patrones

### a. Hooks de Gestión de Estado

Estos hooks suelen utilizar `useState`, `useReducer`, y `useCallback` para crear una interfaz de estado autocontenida para un componente o feature.

- **`useUIDesigner.ts`**:
    - **Propósito**: Es el cerebro del `FlowUIDesignerRefactored`. Gestiona todo el estado local de la personalización de la UI de un flujo, incluyendo el flujo modificado, el paso seleccionado, el modo de vista previa, etc.
    - **Patrón**: Exporta un objeto `state` y un objeto `actions`. Los componentes leen del `state` y llaman a las `actions` para actualizarlo. Esto centraliza toda la lógica de actualización del estado en un solo lugar.

### b. Hooks de Lógica de Negocio

Estos hooks proporcionan funciones reutilizables que realizan tareas específicas. No suelen manejar estado interno, sino que operan con los datos que se les proporcionan.

- **`useTemplateManager.ts`**:
    - **Propósito**: Maneja toda la lógica relacionada con las plantillas de UI. Proporciona funciones para obtener plantillas, filtrar por categoría y, lo más importante, aplicar una plantilla a un flujo.
    - **Patrón**: La función `applyTemplate` es un ejemplo perfecto de lógica de negocio pura: recibe el estado actual, realiza una transformación compleja (fusionando la plantilla con las variantes de diseño) y llama a una función `onUpdate` para devolver el resultado. También interactúa con servicios externos (como `toast` para notificaciones).

### c. Otros Hooks Clave

Aunque no se han inspeccionado en detalle, sus nombres sugieren sus responsabilidades, siguiendo los patrones anteriores:

- **`useAutomatedFlows.ts`**: Probablemente maneja la obtención y gestión del estado de la lista de flujos automatizados.
- **`useFlowExecution.ts`**: Gestiona la lógica y el estado de la ejecución de un flujo en el `FlowRunner`.
- **`useFlowService.ts`**: Podría ser un hook para interactuar con un servicio de backend (API) para guardar o cargar flujos.
- **`useQueryManager.ts`**: Probablemente gestiona la lógica de las consultas o filtros en la aplicación.
- **`useResponsiveLayout.ts`**: Gestiona la lógica para adaptar la UI a diferentes tamaños de pantalla.