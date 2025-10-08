# Plan de Migración: Angular → React (Paridad Completa)

## 📋 Resumen Ejecutivo

Este plan detalla la implementación completa de la plataforma Low-Code en React para lograr **paridad total** con la versión Angular Standalone, incluyendo todos los componentes faltantes, funcionalidades de drag-and-drop, y sistemas avanzados de metadata-driven UI.

## 🎯 Objetivos

1. ✅ Completar paridad de funcionalidades entre Angular y React
2. ✅ Implementar componentes faltantes (QueryDesigner, Backoffice, CertificatesDashboard)
3. ✅ Agregar drag-and-drop con react-dnd para FlowDesigner
4. ✅ Mantener arquitectura metadata-driven con separación de responsabilidades
5. ✅ Implementar sistema de bloqueo (locking) completo
6. ✅ Query chains con resultados en cascada
7. ✅ Formularios dinámicos reactivos con selects dependientes

## 📊 Estado Actual

### ✅ Componentes Implementados (React)

- **App.tsx**: Aplicación principal con tabs (Overview, Run Flows, Flow Designer)
- **FlowDesigner.tsx**: Diseñador de flujos (básico, sin drag-and-drop completo)
- **FlowRunner.tsx**: Ejecutor de pasos individuales
- **FlowRunnerModal.tsx**: Modal para ejecución de flujos
- **DynamicForm.tsx**: Formularios dinámicos con selects en cascada

### ✅ Hooks/Services Implementados

- **useFlowService.ts**: Completo con FlowGroups, locking, query chains, CRUD completo
- **useQueryManager.ts**: Gestión completa de queries con validación y ejecución
- **useFlowExecution.ts**: Ejecución de flujos con estado reactivo

### ❌ Componentes Faltantes (a implementar)

1. **QueryDesigner**: Diseñador visual de queries
2. **Backoffice**: Panel administrativo con pestañas Flows/Queries
3. **CertificatesDashboard**: Dashboard de certificados/documentos publicados
4. **FlowDesigner mejorado**: Implementar drag-and-drop completo con react-dnd

## 🔧 Arquitectura y Principios

### Separación de Responsabilidades (SoC)

```
┌─────────────────────────────────────────┐
│         PRESENTATION LAYER              │
│  (Componentes "tontos" - solo render)   │
│                                         │
│  • Backoffice, FlowDesigner,           │
│  • QueryDesigner, CertificatesDashboard│
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│         ORCHESTRATION LAYER             │
│     (Hooks - lógica de negocio)         │
│                                         │
│  • useFlowService (Flows, Steps)        │
│  • useQueryManager (Queries, Exec)      │
│  • useFlowExecution (State Management)  │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│         DATA/MODEL LAYER                │
│      (Types & Data Structures)          │
│                                         │
│  • Flow, FlowStep, FormField            │
│  • CustomQuery, QueryParameter          │
│  • FlowState, FlowGroup                 │
└─────────────────────────────────────────┘
```

### Metadata-Driven Approach

- **Configuración declarativa**: Flujos y queries definidos como metadata
- **Renderizado dinámico**: UI generada desde configuración
- **Reutilización**: Queries compartidos entre múltiples flujos
- **Validación automática**: Basada en definiciones de metadata

## 📝 Plan de Implementación Detallado

### FASE 1: QueryDesigner Component ✅

**Archivo**: `/components/QueryDesigner.tsx`

**Funcionalidades**:
- ✅ Lista de queries existentes (catalog y final)
- ✅ CRUD completo: Create, Read, Update, Delete
- ✅ Gestión de parámetros dinámicos (FormArray equivalente)
- ✅ Sistema de bloqueo (lock/unlock)
- ✅ Validación de nombres (UPPER_SNAKE_CASE para queries)
- ✅ Diferenciación visual: Catalog vs Final queries
- ✅ Confirmación de eliminación con AlertDialog
- ✅ Edición inline de parámetros con tipos (string, number, date)

**Layout**:
```
┌──────────────────────────────────────────────────────┐
│  Query Designer                    [+ New Query]      │
├────────────┬─────────────────────────────────────────┤
│            │                                          │
│  Queries   │  Selected Query Details / Form          │
│  List      │                                          │
│            │  - Name, Description, Endpoint          │
│  [Query 1] │  - isCatalog toggle                     │
│  [Query 2] │  - Parameters:                          │
│  [Query 3] │    • key, label, type, required         │
│            │                                          │
│            │  [Save] [Cancel] [Lock/Unlock]          │
└────────────┴─────────────────────────────────────────┘
```

**Componentes UI utilizados**:
- Card, CardHeader, CardContent
- Button, Input, Label, Textarea
- Select (para tipos de parámetros)
- Badge (para locked, catalog)
- AlertDialog (confirmación delete)
- Collapsible (para parámetros)

---

### FASE 2: Backoffice Component ✅

**Archivo**: `/components/Backoffice.tsx`

**Funcionalidades**:
- ✅ Pestañas: "Flows" y "Queries"
- ✅ Integración con FlowDesigner (en pestaña Flows)
- ✅ Integración con QueryDesigner (en pestaña Queries)
- ✅ Navegación entre diseñadores
- ✅ Estado global compartido (queries disponibles para flows)

**Layout**:
```
┌──────────────────────────────────────────────────────┐
│  Backoffice                                          │
│                                                       │
│  ┌─────────┬─────────┐                              │
│  │  Flows  │ Queries │                              │
│  └─────────┴─────────┘                              │
│                                                       │
│  ┌────────────────────────────────────────────────┐ │
│  │                                                 │ │
│  │  [Tab Content: FlowDesigner or QueryDesigner]  │ │
│  │                                                 │ │
│  └────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

**Componentes UI utilizados**:
- Tabs, TabsList, TabsTrigger, TabsContent
- Card para layout general

---

### FASE 3: CertificatesDashboard Component ✅

**Archivo**: `/components/CertificatesDashboard.tsx`

**Funcionalidades**:
- ✅ Mostrar solo flows con `availableInCertificates: true`
- ✅ Agrupados por FlowGroup category
- ✅ Botón "Run Flow" para ejecutar directamente
- ✅ Vista de usuario final (no edición)
- ✅ Layout tipo galería/cards

**Layout**:
```
┌──────────────────────────────────────────────────────┐
│  Available Certificates & Documents                  │
│                                                       │
│  Human Resources                                     │
│  ┌─────────────┐  ┌─────────────┐                  │
│  │ Onboarding  │  │ Leave Req.  │                  │
│  │ 3 steps     │  │ 3 steps     │  [Run Flow]     │
│  └─────────────┘  └─────────────┘                  │
│                                                       │
│  Academics                                           │
│  ┌─────────────┐                                    │
│  │ Student     │                                    │
│  │ Enrollment  │  [Run Flow]                       │
│  └─────────────┘                                    │
└──────────────────────────────────────────────────────┘
```

**Componentes UI utilizados**:
- Card, CardHeader, CardContent, CardDescription
- Button (Run Flow)
- Badge (steps count)

---

### FASE 4: FlowDesigner con Drag-and-Drop (react-dnd) ✅

**Archivo**: `/components/FlowDesigner.tsx` (mejorar existente)

**Funcionalidades drag-and-drop**:
- ✅ Reordenar Steps dentro de un Flow
- ✅ Reordenar Fields dentro de un Step
- ✅ Visual feedback durante drag (opacity, cursor)
- ✅ Drop zones claramente definidas
- ✅ Integración con useFlowService: `reorderSteps`, `reorderFields`

**Implementación react-dnd**:

```typescript
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Tipos de items arrastrables
const ItemTypes = {
  STEP: 'step',
  FIELD: 'field',
};

// Componente DraggableStep
const DraggableStep = ({ step, index, moveStep }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.STEP,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.STEP,
    hover: (item) => {
      if (item.index !== index) {
        moveStep(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div ref={(node) => drag(drop(node))} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <GripVertical /> {step.name}
    </div>
  );
};

// Similar para DraggableField
```

**Layout mejorado** (3 columnas):
```
┌──────────────────────────────────────────────────────────────────┐
│  Flow Designer                               [+ New Group]        │
├────────────┬──────────────────┬──────────────────────────────────┤
│            │                  │                                   │
│  Groups    │   Steps          │   Fields & Properties            │
│  & Flows   │   (Draggable)    │   (Draggable)                    │
│            │                  │                                   │
│ [Group 1]  │  [1] Step A ⋮    │  Field Config Form:              │
│  • Flow A  │  [2] Step B ⋮    │  - Key, Label, Type              │
│  • Flow B  │  [3] Step C ⋮    │  - Query (for selects)           │
│            │                  │  - Dependency (cascading)         │
│ [Group 2]  │  [+ Add Step]    │  - Validation rules              │
│  • Flow C  │                  │                                   │
│            │                  │  Fields List:                    │
│            │                  │  [1] name ⋮                      │
│            │                  │  [2] email ⋮                     │
│            │                  │  [+ Add Field]                   │
└────────────┴──────────────────┴──────────────────────────────────┘
```

---

### FASE 5: Integración y Testing ✅

**Actualizar App.tsx**:
- ✅ Agregar tab "Backoffice" con QueryDesigner + FlowDesigner
- ✅ Agregar tab "Certificates" con CertificatesDashboard
- ✅ Mantener tabs existentes: Overview, Run Flows, Designer

**Estructura final de tabs**:
```typescript
<Tabs>
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="certificates">Certificates</TabsTrigger>
    <TabsTrigger value="flows">Run Flows</TabsTrigger>
    <TabsTrigger value="backoffice">Backoffice</TabsTrigger>
  </TabsList>

  <TabsContent value="overview">{/* Dashboard */}</TabsContent>
  <TabsContent value="certificates"><CertificatesDashboard /></TabsContent>
  <TabsContent value="flows">{/* Flow list */}</TabsContent>
  <TabsContent value="backoffice"><Backoffice /></TabsContent>
</Tabs>
```

---

## 🔄 Flujo de Datos Completo

### Query Chain Execution (concatMap pattern)

```typescript
// En FlowRunner al avanzar un step con queryChain:
const executeQueryChain = async (
  chain: QueryChainAction[],
  payload: Record<string, any>
) => {
  const results = {};
  
  for (const action of chain) {
    // Resolver parámetros dinámicamente
    const params = resolveParameters(
      action.parameters,
      payload,
      results
    );
    
    // Ejecutar query
    const result = await executeQuery(action.queryName, params);
    
    // Almacenar resultado para próxima query
    results[action.resultKey] = result;
  }
  
  return results;
};

// Ejemplo:
// 1. FINAL_STUDENT_ENROLLMENT → { studentId: "STU-123" }
// 2. ASSIGN_DEFAULT_COURSE (usa results.enrollmentResult.studentId)
```

### Cascading Selects (Formularios Dinámicos)

```typescript
// En DynamicForm.tsx:
const handleFieldChange = async (key: string, value: any) => {
  setFormData({ ...formData, [key]: value });
  
  // Buscar fields dependientes
  const dependentFields = step.formFields.filter(
    f => f.dependencyKey === key && f.queryName
  );
  
  // Cargar opciones para cada dependiente
  for (const field of dependentFields) {
    const options = await fetchOptions(field.queryName, value);
    setFieldOptions(prev => ({ ...prev, [field.key]: options }));
  }
};
```

---

## 📦 Librerías y Dependencias

### Librerías Principales

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dnd": "^16.x",
    "react-dnd-html5-backend": "^16.x",
    "lucide-react": "latest",
    "sonner@2.0.3": "toast notifications"
  }
}
```

### ShadCN Components Utilizados

- ✅ `accordion`, `alert-dialog`, `alert`
- ✅ `badge`, `button`, `card`
- ✅ `checkbox`, `collapsible`, `dialog`
- ✅ `input`, `label`, `select`
- ✅ `separator`, `switch`, `tabs`
- ✅ `textarea`, `toast` (sonner)

---

## 🎨 Guías de Estilo y UX

### Convenciones de Diseño

1. **Paneles colapsables**: Grupos y secciones grandes
2. **Badges**: Estados (locked, published, required, catalog)
3. **Iconos lucide-react**: Consistencia visual
4. **Confirmaciones**: AlertDialog para acciones destructivas
5. **Feedback visual**: Loading states, toast notifications
6. **Drag handles**: GripVertical icon para elementos arrastrables

### Estados de Locked Items

```typescript
// Visual feedback:
if (flow.locked) {
  // - Mostrar candado icon
  // - Deshabilitar edición
  // - Deshabilitar eliminación
  // - Permitir unlock
  // - Mostrar badge "Locked"
}
```

---

## ✅ Checklist de Paridad Angular ↔ React

### Componentes
- [x] FlowDesigner (básico)
- [x] FlowRunner / FlowRunnerModal
- [x] DynamicForm
- [ ] **QueryDesigner** ⬅️ **A implementar**
- [ ] **Backoffice** ⬅️ **A implementar**
- [ ] **CertificatesDashboard** ⬅️ **A implementar**
- [ ] **FlowDesigner con Drag-and-Drop** ⬅️ **A mejorar**

### Funcionalidades
- [x] FlowGroups (categorías)
- [x] Flow CRUD completo
- [x] Step CRUD completo
- [x] Field CRUD completo
- [x] Query CRUD completo
- [x] Sistema de bloqueo (lock/unlock)
- [x] Query chains con concatMap pattern
- [x] Selects en cascada (dependencyKey)
- [x] Validación de parámetros
- [x] Estado reactivo con hooks
- [ ] **Drag-and-drop Steps** ⬅️ **A implementar**
- [ ] **Drag-and-drop Fields** ⬅️ **A implementar**

### Arquitectura
- [x] Separación de responsabilidades (SoC)
- [x] Metadata-driven UI
- [x] Componentes "tontos" (presentacionales)
- [x] Hooks para lógica (orquestación)
- [x] Types compartidos
- [x] Mock data realista

---

## 🚀 Plan de Ejecución (Orden Recomendado)

### Paso 1: QueryDesigner ⏱️ ~2-3 horas
- Crear componente base
- Implementar lista de queries
- Formulario CRUD
- Gestión de parámetros dinámicos
- Sistema de bloqueo
- Confirmación de eliminación

### Paso 2: CertificatesDashboard ⏱️ ~1 hora
- Filtrar flows publicados
- Layout de cards
- Integración con FlowRunnerModal

### Paso 3: Backoffice ⏱️ ~30 minutos
- Tabs para Flows/Queries
- Integración de componentes existentes

### Paso 4: Drag-and-Drop en FlowDesigner ⏱️ ~2-3 horas
- Setup react-dnd
- DraggableStep component
- DraggableField component
- Visual feedback
- Integración con reorderSteps/reorderFields

### Paso 5: Integración Final y Testing ⏱️ ~1 hora
- Actualizar App.tsx
- Testing end-to-end
- Ajustes UX
- Documentación

**Tiempo total estimado: 7-9 horas**

---

## 📚 Referencias y Documentación

### Angular → React Mapping

| Angular                  | React Equivalent              |
|--------------------------|-------------------------------|
| `@Component`             | `React.FC<Props>`             |
| `signal()` / `computed()`| `useState()` / `useMemo()`    |
| `inject(Service)`        | `useService()` custom hook    |
| `FormBuilder` / `FormGroup` | `useState()` + validation  |
| `FormArray`              | Array state + map             |
| `@if` / `@for`           | `{ condition && ... }` / `map`|
| `@output()`              | Callback props                |
| HTML drag events         | `react-dnd` library           |

### Patrones Clave

1. **Controlled Components**: Formularios con `value={state}` + `onChange`
2. **Lifting State Up**: Estado en hooks, props down
3. **Composition**: Componentes pequeños y reutilizables
4. **Custom Hooks**: Encapsular lógica reutilizable
5. **Separation of Concerns**: Presentación vs Lógica

---

## 🎯 Resultado Final

Al completar este plan, tendremos:

✅ **Plataforma Low-Code completa en React** con paridad total con Angular  
✅ **Backoffice completo** para gestionar Flows y Queries  
✅ **Dashboard público** (Certificates) para usuarios finales  
✅ **Drag-and-drop intuitivo** para diseño de flujos  
✅ **Arquitectura escalable** y mantenible  
✅ **Sistema metadata-driven** completamente funcional  
✅ **Formularios dinámicos avanzados** con selects en cascada  
✅ **Query chains** con resultados encadenados  

---

## 📝 Notas Adicionales

### Mejoras Futuras (Post-MVP)

- [ ] Persistencia en backend real (API REST/GraphQL)
- [ ] Autenticación y autorización
- [ ] Versionamiento de flows
- [ ] Historial de ejecuciones
- [ ] Exportar/Importar flows (JSON)
- [ ] Preview en tiempo real durante diseño
- [ ] Validaciones avanzadas (regex custom)
- [ ] Temas personalizables
- [ ] Internacionalización (i18n)

### Consideraciones de Rendimiento

- Usar `useMemo` para computaciones costosas
- `useCallback` para funciones pasadas como props
- Evitar re-renders innecesarios
- Lazy loading para tabs (React.lazy)
- Virtualización para listas grandes (react-window)

---

**Documento creado el**: 2025-10-05  
**Última actualización**: 2025-10-05  
**Versión**: 1.0  
**Autor**: AI Assistant (Figma Make)

