# Módulo: Types

## 1. Propósito y Funcionalidad

El directorio `src/types/` contiene las definiciones de tipos de TypeScript que sirven como el **modelo de datos central** para toda la aplicación. Su propósito es garantizar la consistencia, seguridad y previsibilidad de los datos en todos los módulos, desde la configuración hasta los componentes y la lógica de negocio.

Este módulo es fundamental para la robustez del proyecto, ya que proporciona una "única fuente de verdad" para la estructura de los datos.

## 2. Archivos de Tipos

### `flow.ts`

Este archivo es el corazón del modelo de datos de la aplicación. Define una serie de interfaces y tipos de TypeScript interconectados que modelan todos los aspectos de la plataforma "Low-Code Multi-Step".

Las definiciones se pueden agrupar en las siguientes categorías principales:

#### a. Estructuras de Flujo Centrales

Estas son las interfaces que definen la estructura fundamental de un flujo de trabajo.

- **`Flow`**: La interfaz principal. Representa un flujo completo con su `id`, `name`, `description` y un array de pasos.
- **`FlowStep`**: Define un paso individual dentro de un flujo. Contiene los campos del formulario (`formFields`), las consultas a ejecutar (`queryChain`), y una gran cantidad de metadatos opcionales para enriquecer la experiencia del usuario (como `helpText`, `objectives`, `difficulty`, etc.).
- **`FormField`**: Define un campo individual en un formulario de un paso, incluyendo su `key`, `label`, `type`, y reglas de validación.

#### b. Tipos de Configuración de UI

Estos tipos están dedicados a la configuración visual y de comportamiento de los flujos y sus componentes. Son la base sobre la que opera el `FlowUIDesigner`.

- **`FlowUIConfig`**, **`StepUIConfig`**, **`FieldUIConfig`**: Interfaces detalladas que permiten una personalización granular de la apariencia de cada nivel del flujo (temas, colores, espaciado, animaciones, etc.).
- **`UITemplate`**: Define la estructura de las plantillas de UI, combinando la configuración de `FlowUIConfig` y `StepUIConfig`.
- **`LayoutVariantConfig`** y **`LayoutPreset`**: Definen las diferentes disposiciones y estilos visuales que una plantilla puede adoptar.

#### c. Tipos de Automatización y Triggers

Estos tipos extienden el modelo de `Flow` para soportar flujos de trabajo automatizados.

- **`AutomatedFlow`**: Una interfaz que extiende `Flow` para incluir conceptos como `triggers` (disparadores), historial de ejecución (`executionHistory`), y estado (`status`).
- **`FlowTrigger`**: Un tipo de unión que define los diferentes tipos de disparadores que pueden iniciar un flujo automatizado (`DatabaseTrigger`, `ScheduleTrigger`, `WebhookTrigger`).
- **`AutomatedFlowExecution`**: Define la estructura de un registro de ejecución de un flujo, incluyendo su estado, duración, logs, etc.

#### d. Tipos de Soporte

- **`CustomQuery`**: Define la estructura para las consultas a APIs que pueden ser utilizadas en los flujos para obtener datos dinámicos.
- **`DragItem`** y **`DropTarget`**: Tipos utilizados por la lógica de arrastrar y soltar (drag-and-drop) en el diseñador de flujos.

En resumen, `flow.ts` actúa como el esquema de la base de datos interna de la aplicación, proporcionando una estructura clara y fuertemente tipada para toda la lógica del negocio.