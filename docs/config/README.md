# Módulo: Config

## 1. Propósito y Funcionalidad

El directorio `src/config/` centraliza la configuración estática y los datos que definen el comportamiento y la apariencia de las features de la aplicación. Su objetivo es desacoplar la configuración de la lógica de los componentes, lo que facilita las actualizaciones y el mantenimiento.

## 2. Archivos de Configuración

### `ui-templates.ts`

Este es el archivo de configuración principal para el `FlowUIDesigner` y es un pilar fundamental de su arquitectura refactorizada.

- **Propósito**: Define todas las plantillas de UI disponibles, sus variantes de diseño (layouts), temas de color y configuraciones de comportamiento.

- **Estructura del Archivo**:
    1.  **`LAYOUT_VARIANTS`**: Un objeto centralizado que define las propiedades de estilo para diferentes variantes de diseño (ej. `modern-sidebar-left`, `minimal-full-width`). Esto incluye colores, fondos, espaciado y más. La reutilización de estas variantes entre diferentes plantillas reduce la duplicación de código.
    2.  **`TEMPLATE_REGISTRY`**: Un array que define cada plantilla de UI disponible. Cada objeto de plantilla contiene:
        - Un `id`, `name`, `description` y `category`.
        - Configuraciones por defecto para el flujo (`flowConfig`) y los pasos (`stepConfig`).
        - Un array de `layoutVariants` que la plantilla puede utilizar, haciendo referencia a las claves del objeto `LAYOUT_VARIANTS`.
    3.  **Funciones de Utilidad**:
        - `getTemplateRegistry()`: Devuelve todas las plantillas registradas.
        - `getLayoutVariant()`: Obtiene una configuración de variante de diseño específica.
        - `getAvailableLayoutPresets()`: Devuelve una lista de todos los presets de diseño disponibles.

- **Impacto**: Este enfoque permite que añadir o modificar una plantilla de UI sea tan simple como editar este archivo, sin necesidad de tocar la lógica de los componentes de React. Esto hace que el sistema sea altamente escalable y fácil de mantener.