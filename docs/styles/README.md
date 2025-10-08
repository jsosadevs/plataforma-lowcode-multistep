# Módulo: Styles

## 1. Propósito y Funcionalidad

El directorio `src/styles/` contiene los archivos de estilo globales que definen la base del sistema de diseño de la aplicación. Su propósito es establecer las bases visuales, incluyendo el tema, las tipografías y las utilidades de CSS globales.

## 2. Archivos de Estilo

### `globals.css`

Este archivo es el pilar del sistema de estilos de la aplicación. En lugar de depender únicamente de un framework como Tailwind CSS para todo, utiliza un enfoque híbrido centrado en **CSS Custom Properties (Variables)** para el theming.

- **Sistema de Theming Basado en Variables**:
    - El archivo define un conjunto exhaustivo de variables CSS dentro del selector `:root` para el **tema claro (light mode)**. Estas variables (`--background`, `--primary`, `--card`, `--radius`, etc.) actúan como los "design tokens" del sistema.
    - Se define un bloque `.dark` que sobreescribe estas mismas variables para implementar el **tema oscuro (dark mode)**.
    - Esto permite cambiar de tema de forma dinámica simplemente aplicando la clase `.dark` a un elemento contenedor (probablemente `<body>` o `<html>`).

- **Uso de `@layer`**:
    - El archivo utiliza la regla `@layer` de CSS para organizar los estilos en capas (`base` y `utilities`), similar a como lo hace Tailwind CSS.
    - La capa `base` define estilos por defecto para elementos HTML como `body` y encabezados (`h1`, `h2`, etc.), aplicando los colores y fuentes definidos en las variables.
    - La capa `utilities` contiene clases de utilidad personalizadas, como `.sr-only` para accesibilidad o `.line-clamp-2` para truncar texto.

- **Estilos Específicos de Componentes**:
    - El archivo también contiene estilos específicos para componentes complejos como diálogos a pantalla completa (`[data-slot="fullscreen-dialog-content"]`) y manejadores de redimensionamiento (`[data-slot="resizable-handle"]`), asegurando una apariencia y comportamiento consistentes para estas partes de la UI.

## 3. Integración con Tailwind CSS (o similar)

Aunque el archivo utiliza directivas `@apply` dentro de la capa `base`, lo cual es una característica de Tailwind CSS, el sistema de theming principal se basa en variables CSS. Esto sugiere que el proyecto utiliza Tailwind (o una herramienta similar) principalmente por sus **clases de utilidad** y su motor de procesamiento, pero define su propio sistema de diseño y theming a través de `globals.css` en lugar de usar el `tailwind.config.js` para los colores, espaciado, etc. Esta es una estrategia avanzada que ofrece un alto grado of personalización.