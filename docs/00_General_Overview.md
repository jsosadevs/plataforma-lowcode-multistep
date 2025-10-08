# Descripción General del Proyecto: Plataforma Low-Code Multi-Paso

## 1. Resumen de Alto Nivel

Este proyecto es una "Plataforma Low-Code Multi-Paso", diseñada para permitir a los usuarios crear aplicaciones o flujos de trabajo complejos con una mínima intervención de código. Basado en la estructura inicial y las dependencias, el sistema parece ser una aplicación web front-end construida con tecnologías modernas para facilitar la creación de interfaces de usuario interactivas.

## 2. Stack Tecnológico

La aplicación está construida sobre un stack de JavaScript moderno, enfocado principalmente en React.

- **Framework Principal:** React (`react`, `react-dom`).
- **Bundler/Dev Server:** Vite (`vite`, `@vitejs/plugin-react-swc`), que proporciona un entorno de desarrollo rápido y un proceso de build optimizado.
- **Lenguaje:** TypeScript (implícito por los archivos `.tsx` y las dependencias `@types/`).
- **Componentes de UI:** La biblioteca de componentes se basa en gran medida en [Radix UI](https://www.radix-ui.com/), una colección de primitivas de UI de bajo nivel y sin estilo para React. Esto se complementa con:
    - `lucide-react` para iconos.
    - `class-variance-authority` y `tailwind-merge` para la gestión de clases CSS, sugiriendo el uso de Tailwind CSS o una utilidad similar.
    - Componentes específicos como `recharts` para gráficos, `react-day-picker` para calendarios y `embla-carousel-react` para carruseles.
- **Gestión de Formularios:** `react-hook-form` para la gestión de estados de formularios.
- **Observación Inusual:** Se han detectado dependencias de **Angular** (`@angular/common`, `@angular/core`, etc.) en `package.json`. Esto es atípico para un proyecto basado en Vite y React. Podría ser un remanente de una migración anterior, un error en la configuración de dependencias o un intento de micro-frontend. Se recomienda investigar y, si no son necesarias, eliminarlas para evitar un tamaño de paquete innecesariamente grande y posibles conflictos.

## 3. Estructura de Carpetas del Proyecto

La estructura del código fuente (`src/`) está organizada por funcionalidad, lo que facilita la localización y el mantenimiento del código.

- `src/`: Directorio raíz del código fuente de la aplicación.
- `src/BaseAPP/`: Contiene la lógica principal de la aplicación o el componente raíz.
- `src/components/`: Alberga componentes de UI reutilizables que se utilizan en toda la aplicación.
- `src/config/`: Archivos de configuración específicos de la aplicación.
- `src/hooks/`: Custom hooks de React para encapsular y reutilizar lógica con estado.
- `src/styles/`: Archivos de estilos globales y relacionados con la configuración de CSS.
- `src/types/`: Definiciones de tipos de TypeScript compartidas en todo el proyecto.
- `src/main.tsx`: Punto de entrada de la aplicación React.
- `src/App.tsx`: Componente raíz de la aplicación.