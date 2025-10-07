# Análisis de la Lógica de la Aplicación: Plataforma Low-Code Multi-Paso

## 1. Arquitectura General

La aplicación es una **plataforma low-code** diseñada para crear y ejecutar flujos de trabajo dinámicos y de múltiples pasos. Está construida con **React** y sigue una arquitectura moderna y bien estructurada que separa las preocupaciones (separation of concerns).

El componente principal, `App.tsx`, actúa como el orquestador principal, gestionando la navegación entre las diferentes secciones de la aplicación y el estado global de la ejecución de flujos.

La arquitectura se puede resumir en los siguientes puntos clave:

- **Basada en Metadatos:** Los flujos, pasos, y formularios no están codificados directamente en el código, sino que se definen a través de estructuras de datos (metadatos) que la aplicación interpreta para renderizar la interfaz y ejecutar la lógica.
- **Componentes y Hooks:** La lógica de negocio está encapsulada en **hooks de React** (`src/hooks/`), mientras que la interfaz de usuario está compuesta por **componentes de React** (`src/components/`). Esto sigue el patrón "Smart Hooks, Dumb Components".
- **Interfaz de Usuario por Pestañas:** La navegación principal se organiza en pestañas, cada una representando una funcionalidad principal de la plataforma:
    1.  **Overview:** Un panel de control con estadísticas generales.
    2.  **Certificates:** Una sección para procesos específicos de generación de documentos o certificados.
    3.  **Manual Flows:** Para ejecutar flujos iniciados por el usuario.
    4.  **Automated Flows:** Para gestionar flujos que se ejecutan automáticamente (basados en triggers o programados).
    5.  **Backoffice:** El área de administración para diseñar y configurar los flujos y consultas.
- **Diseño Responsivo:** La aplicación está diseñada para ser funcional en diferentes tamaños de pantalla, desde móviles hasta escritorios.

## 2. Flujo de Datos y Lógica de Negocio

El núcleo de la aplicación reside en la gestión y ejecución de "flujos".

### Hooks Principales (Lógica de Negocio)

La lógica de negocio está centralizada en los siguientes hooks:

- **`useFlowService`**:
    - Gestiona la carga y manipulación de los flujos manuales y sus agrupaciones.
    - Probablemente se encarga de obtener los datos de los flujos desde una API, una base de datos local o un archivo de configuración.
- **`useAutomatedFlows`**:
    - Similar a `useFlowService`, pero enfocado en los flujos automáticos.
    - Gestiona la creación, activación y monitoreo de estos flujos.
- **`useQueryManager`**:
    - Administra las "consultas" (queries), que parecen ser fuentes de datos reutilizables que pueden ser utilizadas dentro de los flujos.
- **`useCommonActions`**:
    - Proporciona funciones de acción comunes, como "ejecutar" o "ver", para mantener la consistencia en la interfaz.

### Componentes Principales (Interfaz de Usuario)

- **`App.tsx`**:
    - Orquesta la aplicación, gestionando el estado de la pestaña activa y el flujo en ejecución.
- **`FlowDesignerDnD` (`src/components/FlowDesignerDnD.tsx`)**:
    - Un diseñador de flujos con funcionalidad de arrastrar y soltar (Drag and Drop). Es el corazón del **Backoffice**.
    - Permite a los usuarios crear y modificar los pasos de un flujo de manera visual.
- **`FlowRunnerModal` (`src/components/FlowRunnerModal.tsx`)**:
    - Un modal que se encarga de ejecutar un flujo paso a paso.
    - Renderiza los formularios dinámicos definidos en los metadatos de cada paso.
    - Recibe un `flowId` y un `context` para saber qué flujo ejecutar y desde dónde se inició (por ejemplo, desde el Backoffice en modo diseño o desde la lista de flujos en modo ejecución).
- **`Backoffice.tsx`**:
    - El componente que renderiza el área de administración. Probablemente contiene el `FlowDesignerDnD` y otras herramientas para gestionar flujos y consultas.
- **`AutomatedFlowsManager.tsx`**:
    - Interfaz para gestionar los flujos automatizados.
- **`CertificatesDashboard.tsx`**:
    - Dashboard específico para los flujos de "certificados".

## 3. Estructura de un Flujo

Aunque no he visto los tipos de datos (`types/`) todavía, puedo inferir la estructura de un flujo basándome en el código de `App.tsx`:

- **Flow Group:** Una categoría o agrupación de flujos (ej. "Onboarding", "Solicitudes").
- **Flow:** Un proceso completo con un nombre, descripción y una serie de pasos.
    - `id`: Identificador único.
    - `name`: Nombre del flujo.
    - `description`: Descripción.
    - `steps`: Un array de objetos `Step`.
    - `locked`: Un booleano que indica si el flujo está bloqueado o no.
- **Step:** Una etapa dentro de un flujo.
    - `id`: Identificador único del paso.
    - `name`: Nombre del paso.
    - `formFields`: Un array de campos que componen el formulario de este paso.

## 4. Proceso de Ejecución de un Flujo

1.  El usuario hace clic en el botón "Run Flow" en algún lugar de la aplicación (por ejemplo, en la lista de flujos manuales).
2.  Se llama a la función `handlePreviewFlow(flowId, context)`.
3.  El estado `runningFlowId` se actualiza con el ID del flujo a ejecutar.
4.  El `FlowRunnerModal` se abre, ya que su prop `isOpen` depende de `!!runningFlowId`.
5.  El `FlowRunnerModal` recibe el `flowId` y, utilizando probablemente el `useFlowService`, carga los detalles del flujo y sus pasos.
6.  El modal renderiza el primer paso del flujo como un formulario dinámico.
7.  A medida que el usuario completa cada paso, el `FlowRunnerModal` gestiona el estado de los datos recogidos y avanza al siguiente paso.
8.  Una vez que todos los pasos se completan, se llama a la función `onComplete`, pasando los datos recopilados.
9.  Finalmente, `handleCloseRunner` se llama para cerrar el modal, reseteando el estado `runningFlowId`.

## 5. Conclusión de la Lógica

La aplicación es una plataforma robusta y bien diseñada para la creación y ejecución de flujos de trabajo. Su arquitectura modular, basada en hooks para la lógica y componentes para la UI, la hace escalable y mantenible. El uso de un diseñador visual (`FlowDesignerDnD`) y un ejecutor de flujos dinámico (`FlowRunnerModal`) son los pilares de su funcionalidad low-code.