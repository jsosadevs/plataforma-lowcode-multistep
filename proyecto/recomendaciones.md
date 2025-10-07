# Recomendaciones para la Refactorización y Mejora

Este documento presenta una serie de recomendaciones basadas en los hallazgos identificados en el archivo `hallazgos.md`. El objetivo es mejorar la mantenibilidad, escalabilidad y calidad general del código de la plataforma.

## 1. Refactorización de los Modelos de Datos (`src/types/flow.ts`)

### 1.1. Unificar las Propiedades de `FlowStep`

-   **Recomendación:** Eliminar la duplicación de propiedades en la interfaz `FlowStep`. Se debe elegir una única fuente de verdad. La estructura anidada `customInfo` parece ser la más organizada y escalable.

-   **Acción Concreta:**
    1.  Eliminar las propiedades duplicadas (`objectives`, `keyPoints`, etc.) del nivel raíz de `FlowStep`.
    2.  Mantener únicamente el objeto `customInfo` con todas estas propiedades.
    3.  Asegurarse de que `customInfo.enabled` controle si estas propiedades se utilizan o no.
    4.  Refactorizar todos los componentes y hooks que usen `FlowStep` para que accedan a estas propiedades a través de `step.customInfo.propertyName`.

    **Ejemplo (Antes):**
    ```typescript
    const objectives = step.objectives || step.customInfo?.objectives;
    ```

    **Ejemplo (Después):**
    ```typescript
    const objectives = step.customInfo?.enabled ? step.customInfo.objectives : undefined;
    ```

### 1.2. Simplificar la Configuración de la Interfaz de Usuario (UI)

-   **Recomendación:** Reducir la granularidad de las configuraciones de UI (`FieldUIConfig`, `StepUIConfig`, `FlowUIConfig`) a favor de un sistema de "presets" o temas. Esto simplificará tanto la configuración para los usuarios como la implementación en el código.

-   **Acción Concreta:**
    1.  **Crear Presets:** Definir un conjunto de "presets" de UI (ej. `compact`, `detailed`, `wizard-style`) que contengan configuraciones predefinidas para `Flow`, `Step`, y `Field`.
    2.  **Refactorizar Tipos:** Modificar los tipos `Flow`, `Step`, y `Field` para que en lugar de tener un objeto `uiConfig` con docenas de opciones, tengan una propiedad `uiPreset: string`.
    3.  **Crear un "Theme Provider" o Mapeador:** Implementar una función o un hook que, dado un `uiPreset`, devuelva el objeto de configuración CSS o de estilo correspondiente. Esto centraliza la lógica de la UI.

### 1.3. Mejorar la Seguridad de Tipos (Type Safety)

-   **Recomendación:** Reemplazar el uso de `any` en `DatabaseTrigger` por un tipo más seguro.

-   **Acción Concreta:**
    -   Utilizar `unknown` en lugar de `any` para la propiedad `value`. Esto forzará al código que consume este valor a realizar una verificación de tipo antes de poder usarlo, lo que previene errores en tiempo de ejecución.
    -   Si los tipos de `value` son predecibles (ej. `string | number | boolean`), se puede usar un tipo de unión en su lugar.

    ```typescript
    // Opción 1: Usando unknown
    value: unknown;

    // Opción 2: Usando un tipo de unión
    value: string | number | boolean | Date;
    ```

## 2. Mejora de la Gestión de Estado

### 2.1. Crear un Hook `useFlowRunner`

-   **Recomendación:** Extraer toda la lógica relacionada con la ejecución de un flujo desde `App.tsx` a un hook personalizado `useFlowRunner`.

-   **Acción Concreta:**
    1.  Crear un nuevo archivo `src/hooks/useFlowRunner.ts`.
    2.  Mover los estados `runningFlowId` y `flowExecutionContext` a este hook.
    3.  Mover las funciones `handlePreviewFlow`, `handleCloseRunner`, y `handleFlowComplete` al hook y exponerlas.
    4.  El hook debería devolver el estado actual (ej. `is_running`, `flow_id`, `context`) y las funciones para controlar el runner.
    5.  Refactorizar `App.tsx` para que utilice este nuevo hook. Esto limpiará el componente principal y centralizará la lógica del runner.

    **Ejemplo de uso en `App.tsx`:**
    ```typescript
    const { isRunning, runFlow, closeRunner } = useFlowRunner({ onComplete: handleFlowComplete });
    // ...
    <Button onClick={() => runFlow(flow.id, 'flows')}>Run Flow</Button>
    // ...
    <FlowRunnerModal
      isOpen={isRunning}
      onClose={closeRunner}
      // ...
    />
    ```

## 3. Mejoras en la Estructura del Código

### 3.1. Implementar "Barrel Files"

-   **Recomendación:** Utilizar archivos `index.ts` (barrel files) en los directorios `src/components` y `src/hooks` para simplificar las importaciones.

-   **Acción Concreta:**
    1.  Crear un archivo `src/components/index.ts` y exportar todos los componentes desde él.
        ```typescript
        // src/components/index.ts
        export * from './FlowDesignerDnD';
        export * from './FlowRunnerModal';
        // ... etc.
        ```
    2.  Crear un archivo `src/hooks/index.ts` y exportar todos los hooks desde él.
        ```typescript
        // src/hooks/index.ts
        export * from './useFlowService';
        export * from './useQueryManager';
        // ... etc.
        ```
    3.  Refactorizar las importaciones en `App.tsx` y otros archivos para que usen la ruta del directorio en lugar de la ruta completa del archivo.

### 3.2. Separar Modelos de Dominio y Modelos de UI

-   **Recomendación:** A largo plazo, considerar la posibilidad de separar los modelos de datos del dominio (la lógica de negocio) de los modelos de configuración de la UI.

-   **Acción Concreta (Estrategia a Futuro):**
    1.  **Crear un directorio `src/domain`:** Mover los tipos principales como `Flow`, `FlowStep`, `CustomQuery` a este directorio. Estos tipos no deberían contener ninguna referencia a la UI.
    2.  **Adaptadores de UI:** En el directorio `src/types`, crear tipos que extiendan los tipos del dominio y les añadan las propiedades de UI. Por ejemplo:
        ```typescript
        import { Flow as DomainFlow } from '../domain/flow';

        export interface UIFlow extends DomainFlow {
          uiConfig?: FlowUIConfig;
        }
        ```
    3.  **Mapeo:** La capa de la aplicación (hooks o componentes) sería responsable de combinar los datos del dominio con la configuración de la UI para renderizar la interfaz.

Esta separación hace que el núcleo de la aplicación sea independiente de la tecnología de frontend y más fácil de probar y reutilizar.