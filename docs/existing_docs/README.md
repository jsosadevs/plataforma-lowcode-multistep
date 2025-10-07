# 🚀 Plataforma Low-Code - Metadata-Driven Flow Platform

Una plataforma completa para crear y ejecutar flujos dinámicos multi-paso con arquitectura metadata-driven, implementada en React con TypeScript.

## ✨ Características Principales

### 🎯 Funcionalidades Core

- **✅ Diseñador Visual de Flujos** con drag-and-drop (react-dnd)
- **✅ Diseñador de Queries** con parámetros dinámicos
- **✅ Dashboard de Certificados** para usuarios finales
- **✅ Backoffice Completo** con tabs Flows/Queries
- **✅ Formularios Dinámicos** con validación en tiempo real
- **✅ Selects en Cascada** (dependent dropdowns)
- **✅ Query Chains** con resultados encadenados
- **✅ Sistema de Bloqueo** para flows y queries
- **✅ Ejecución Secuencial** con concatMap pattern
- **✅ Mapeo Dinámico de Parámetros** (payload.x, results.y.z)

### 🏗️ Arquitectura

```
Presentation Layer (UI Components)
         ↓
Orchestration Layer (Custom Hooks)
         ↓
Data Layer (Types & Models)
```

**Principios**:
- **Metadata-Driven**: UI generada desde configuración
- **Separation of Concerns**: Componentes "tontos" + hooks inteligentes
- **Reactive**: Estado reactivo con React hooks
- **Type-Safe**: TypeScript en toda la aplicación

## 📦 Estructura del Proyecto

```
/
├── App.tsx                          # Main app (4 tabs)
│
├── components/
│   ├── QueryDesigner.tsx            # Diseñador de queries
│   ├── CertificatesDashboard.tsx    # Dashboard público
│   ├── Backoffice.tsx               # Panel admin
│   ├── FlowDesignerDnD.tsx          # Diseñador con drag-and-drop
│   ├── FlowRunnerModal.tsx          # Ejecutor modal
│   ├── FlowRunner.tsx               # Renderizador de steps
│   ├── DynamicForm.tsx              # Formularios dinámicos
│   └── ui/                          # ShadCN components
│
├── hooks/
│   ├── useFlowService.ts            # Gestión de flows
│   ├── useQueryManager.ts           # Gestión de queries
│   └── useFlowExecution.ts          # Ejecución de flows
│
├── types/
│   └── flow.ts                      # Definiciones TypeScript
│
└── docs/
    ├── MIGRATION_PLAN.md            # Plan detallado
    ├── IMPLEMENTATION_COMPLETE.md   # Resumen técnico
    └── USAGE_GUIDE.md               # Guía de usuario
```

## 🎨 Componentes Visuales

### Overview Dashboard
- Estadísticas generales
- Quick start guides
- Accesos rápidos

### Certificates Dashboard
- Flows publicados agrupados
- Ejecución directa
- UI de usuario final

### All Flows
- Lista completa de flows
- Filtrado por categorías
- Estados visuales

### Backoffice
**Tab Flows**: FlowDesigner con drag-and-drop
```
┌──────────┬───────────────┬──────────────────┐
│ Groups   │    Steps      │   Properties     │
│ & Flows  │  (Draggable)  │   & Fields       │
└──────────┴───────────────┴──────────────────┘
```

**Tab Queries**: QueryDesigner
```
┌─────────────┬────────────────────┐
│  Queries    │   Details/Form     │
│  List       │                    │
└─────────────┴────────────────────┘
```

## 🔧 Tecnologías Utilizadas

### Core
- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Tailwind CSS v4** - Styling
- **Vite** - Build Tool

### UI Components
- **ShadCN UI** - Component Library
- **Lucide React** - Icons
- **Sonner** - Toast Notifications

### Drag & Drop
- **react-dnd** - Drag and drop functionality
- **react-dnd-html5-backend** - HTML5 backend

## 🚀 Inicio Rápido

### Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### Uso Básico

1. **Crear un Query**:
   - Ir a Backoffice → Queries
   - Click "New Query"
   - Configurar nombre, endpoint, parámetros
   - Guardar

2. **Crear un Flow**:
   - Ir a Backoffice → Flows
   - Click "New Group" (si es necesario)
   - Click "+" en el grupo
   - Configurar flow, steps y fields
   - Usar drag-and-drop para reordenar

3. **Ejecutar un Flow**:
   - Ir a Certificates (si está publicado)
   - O ir a All Flows
   - Click "Start Process" / "Run Flow"
   - Completar formularios paso a paso

## 📚 Documentación

### Guías Disponibles

- **[USAGE_GUIDE.md](./USAGE_GUIDE.md)** - Guía completa de usuario
- **[MIGRATION_PLAN.md](./MIGRATION_PLAN.md)** - Plan de implementación
- **[IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)** - Detalles técnicos

### Conceptos Clave

#### Metadata-Driven UI
```typescript
// Los flows se definen como metadata:
const flow: Flow = {
  id: 'user-onboarding',
  name: 'User Onboarding',
  steps: [
    {
      id: 'personal-info',
      formFields: [
        { key: 'name', label: 'Name', type: 'text', required: true }
      ]
    }
  ]
};

// La UI se renderiza dinámicamente desde esta configuración
```

#### Cascading Selects
```typescript
// Parent field
{ 
  key: 'faculty', 
  type: 'select', 
  queryName: 'GET_FACULTIES' 
}

// Child field (depende de faculty)
{ 
  key: 'career', 
  type: 'select', 
  queryName: 'GET_CAREERS_BY_FACULTY',
  dependencyKey: 'faculty'  // ← Crea la cascada
}
```

#### Query Chains
```typescript
queryChain: [
  {
    queryName: 'CREATE_USER',
    resultKey: 'userResult',
    parameters: { 
      name: 'payload.name',
      email: 'payload.email' 
    }
  },
  {
    queryName: 'ASSIGN_ROLE',
    resultKey: 'roleResult',
    parameters: { 
      userId: 'results.userResult.userId'  // ← Usa resultado anterior
    }
  }
]
```

## 🎯 Casos de Uso

### 1. Onboarding de Empleados
- Step 1: Información personal
- Step 2: Información laboral
- Step 3: Asignación de equipos
- Query Chain: Crear usuario → Asignar rol → Enviar email

### 2. Inscripción de Estudiantes
- Step 1: Selección de programa (cascading selects)
- Step 2: Datos del estudiante
- Query Chain: Inscribir → Asignar curso → Notificar

### 3. Solicitud de Documentos
- Step 1: Tipo de documento
- Step 2: Datos requeridos
- Step 3: Confirmación
- Query: Generar documento

## 🔒 Sistema de Bloqueo

```typescript
// Flows y Queries pueden ser bloqueados
if (flow.locked) {
  // ❌ No editable
  // ❌ No eliminable
  // ❌ No drag-and-drop
  // ✅ Ejecutable
}
```

**Uso**: Proteger flows/queries en producción mientras se permite su ejecución

## 🎨 UI/UX Features

### Feedback Visual
- ✅ Loading states
- ✅ Success/Error toasts
- ✅ Progress indicators
- ✅ Drag-and-drop feedback

### Estados
- ✅ Empty states informativos
- ✅ Error handling
- ✅ Validation messages
- ✅ Confirmación dialogs

### Responsive
- ✅ Mobile-friendly
- ✅ Layouts adaptativos
- ✅ Touch-friendly controls

## 🧪 Testing

### Escenarios de Prueba

```bash
# Queries
✓ Crear catalog query
✓ Crear final query con parámetros
✓ Editar/Eliminar queries
✓ Lock/Unlock queries

# Flows
✓ Crear flow group
✓ Crear flow con steps
✓ Drag-and-drop steps
✓ Drag-and-drop fields
✓ Configurar cascading selects
✓ Configurar query chains

# Execution
✓ Ejecutar flow simple
✓ Ejecutar flow con cascading selects
✓ Ejecutar flow con query chain
✓ Navegación entre steps
```

## 🚦 Estado del Proyecto

### ✅ Completado (100%)

- [x] QueryDesigner
- [x] CertificatesDashboard
- [x] Backoffice
- [x] FlowDesignerDnD con drag-and-drop
- [x] Sistema de bloqueo
- [x] Query chains
- [x] Cascading selects
- [x] Formularios dinámicos
- [x] Validación
- [x] Toast notifications

### 🎯 Próximas Mejoras

- [ ] Backend API integration
- [ ] Authentication
- [ ] Persistencia en base de datos
- [ ] Versionamiento de flows
- [ ] Historial de ejecuciones
- [ ] Exportar/Importar flows
- [ ] Flow visualization (flowchart)
- [ ] Dark mode
- [ ] i18n

## 🤝 Contribuir

### Setup de Desarrollo

```bash
# Clonar repositorio
git clone <repo-url>

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Build para producción
npm run build
```

### Convenciones

**Nomenclatura**:
- Queries: `UPPER_SNAKE_CASE`
- Flow IDs: `kebab-case`
- Field keys: `snake_case`
- Components: `PascalCase`

**Commits**:
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
refactor: Refactor code
style: Update styling
```

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles

## 📞 Soporte

Para preguntas o issues:
- Revisar [USAGE_GUIDE.md](./USAGE_GUIDE.md)
- Revisar [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)
- Abrir un issue en GitHub

---

## 🌟 Highlights

### Arquitectura Metadata-Driven
> Toda la UI se genera dinámicamente desde configuración JSON, permitiendo crear flujos complejos sin código

### Drag-and-Drop Intuitivo
> Reordena steps y fields con un simple drag, con feedback visual inmediato

### Query Chains Potentes
> Ejecuta secuencias de queries con resultados encadenados, ideal para procesos complejos

### Formularios Inteligentes
> Selects en cascada, validación en tiempo real, y carga dinámica de opciones

---

**Desarrollado con** ❤️ **usando React + TypeScript + Tailwind CSS**

**Versión**: 1.0  
**Fecha**: 2025-10-05  
**Status**: ✅ Producción Ready

