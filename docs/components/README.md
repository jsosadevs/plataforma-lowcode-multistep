# Módulo: Components

## 1. Propósito y Funcionalidad

El directorio `src/components/` es el corazón de la interfaz de usuario de la "Plataforma Low-Code Multi-Paso". Contiene todos los componentes de React necesarios para construir la aplicación, desde los elementos de UI más básicos hasta las funcionalidades de negocio más complejas.

La estructura de este módulo está organizada en tres niveles jerárquicos:

1.  **Componentes de UI Base (`src/components/ui/`)**: Primitivas de UI fundamentales.
2.  **Componentes de Features (`src/components/`)**: Componentes complejos que orquestan la lógica de negocio.
3.  **Componentes Específicos (`src/components/figma/`, `src/components/ui-designer/`)**: Componentes para funcionalidades muy concretas.

## 2. Estructura y Desglose

### a. Componentes de UI Base (`src/components/ui/`)

Este directorio funciona como el sistema de diseño de la aplicación. Contiene un conjunto completo de componentes de UI reutilizables y de bajo nivel.

- **Propósito**: Proporcionar los bloques de construcción visuales para toda la aplicación, garantizando una apariencia consistente.
- **Contenido**: Incluye componentes como `Button`, `Card`, `Input`, `Dialog`, `Table`, `Select`, etc.
- **Tecnología**: La mayoría de estos componentes son probablemente wrappers estilizados sobre las primitivas de [Radix UI](https://www.radix-ui.com/), utilizando utilidades como `tailwind-merge` para la gestión de estilos.

### b. Componentes de Features (Raíz de `src/components/`)

Estos son componentes de alto nivel que implementan las principales funcionalidades de la plataforma.

- **Propósito**: Encapsular la lógica de negocio y componer los componentes de UI base para crear las interfaces de usuario de las features.
- **Ejemplos Notables**:
    - `FlowDesigner.tsx`: El lienzo o interfaz principal para diseñar flujos.
    - `AutomatedFlowsManager.tsx`: Un panel para gestionar los flujos automatizados existentes.
    - `FlowRunner.tsx`: El componente que ejecuta un flujo diseñado.
    - `FlowUIDesignerRefactored.tsx`: El orquestador principal para la personalización visual de los flujos, que ha sido refactorizado para una mejor mantenibilidad (según `src/components/ui-designer/README.md`).
    - `Backoffice.tsx`: Probablemente un panel de administración.

### c. Módulos de Componentes Específicos

#### `src/components/ui-designer/`

- **Propósito**: Contiene los componentes que conforman las pestañas de configuración del `FlowUIDesignerRefactored`. Este módulo ha sido refactorizado para separar la lógica del estado (`useUIDesigner` hook) de la UI.
- **Contenido**: `TemplatesTab.tsx`, `FlowConfigTab.tsx`, `StepConfigTab.tsx`.

#### `src/components/figma/`

- **Propósito**: Componentes relacionados con la integración de Figma.
- **Contenido**: Actualmente solo contiene `ImageWithFallback.tsx`, un componente de imagen que probablemente maneja casos donde una imagen de Figma podría no cargarse.

## 3. Flujo de Datos y Lógica

- La lógica de estado compleja se abstrae en custom hooks (ver módulo `hooks`), como se detalla en la documentación del `ui-designer`.
- Los componentes de features utilizan los componentes de UI base para construir sus interfaces.
- Los datos y la configuración, como las plantillas de UI, se gestionan en el módulo `config`.