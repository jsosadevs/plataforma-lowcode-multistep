# 💻 Ejemplos de Código - Plataforma Low-Code

## 📚 Índice

1. [Crear Queries](#crear-queries)
2. [Crear Flows](#crear-flows)
3. [Configurar Cascading Selects](#configurar-cascading-selects)
4. [Configurar Query Chains](#configurar-query-chains)
5. [Usar Hooks Personalizados](#usar-hooks-personalizados)
6. [Implementar Drag-and-Drop](#implementar-drag-and-drop)

---

## 1. Crear Queries

### Catalog Query (para dropdowns)

```typescript
const catalogQuery: CustomQuery = {
  name: 'GET_DEPARTMENTS',
  description: 'Retrieves all active departments',
  targetEndpoint: 'GET_DEPARTMENTS',
  isCatalog: true,
  parameters: [
    {
      key: 'companyId',
      label: 'Company ID',
      type: 'string',
      required: true
    }
  ],
  locked: false
};

// Uso en useQueryManager:
const { createQuery } = useQueryManager();
const result = createQuery(catalogQuery);

if (result.success) {
  toast.success('Query created successfully');
}
```

### Final Query (para query chains)

```typescript
const finalQuery: CustomQuery = {
  name: 'CREATE_EMPLOYEE',
  description: 'Creates a new employee record in the system',
  targetEndpoint: '/api/employees',
  isCatalog: false,
  parameters: [
    { key: 'full_name', label: 'Full Name', type: 'string', required: true },
    { key: 'email', label: 'Email', type: 'string', required: true },
    { key: 'department_id', label: 'Department ID', type: 'number', required: true },
    { key: 'hire_date', label: 'Hire Date', type: 'date', required: true }
  ],
  locked: false
};
```

### Query con Validación de Parámetros

```typescript
// En useQueryManager.ts - executeQuery:
const executeQuery = async (queryName: string, params: Record<string, any>) => {
  const query = queries.find(q => q.name === queryName);
  
  if (!query) {
    throw new Error(`Query "${queryName}" not found`);
  }

  // Validación automática
  for (const param of query.parameters) {
    const value = params[param.key];
    
    if (param.required && !value) {
      throw new Error(`Missing required parameter: "${param.key}"`);
    }
    
    if (value && param.type === 'number' && isNaN(Number(value))) {
      throw new Error(`Type mismatch for "${param.key}": expected number`);
    }
    
    if (value && param.type === 'date' && isNaN(new Date(value).getTime())) {
      throw new Error(`Type mismatch for "${param.key}": expected valid date`);
    }
  }
  
  // Ejecutar query...
};
```

---

## 2. Crear Flows

### Flow Básico

```typescript
const basicFlow: Flow = {
  id: 'employee-onboarding',
  name: 'Employee Onboarding',
  description: 'Complete onboarding process for new employees',
  steps: [
    {
      id: 'personal-info',
      name: 'Personal Information',
      description: 'Enter your personal details',
      formFields: [
        { 
          key: 'full_name', 
          label: 'Full Name', 
          type: 'text', 
          required: true,
          placeholder: 'Enter your full name'
        },
        { 
          key: 'email', 
          label: 'Email Address', 
          type: 'email', 
          required: true,
          placeholder: 'name@company.com'
        },
        { 
          key: 'phone', 
          label: 'Phone Number', 
          type: 'text', 
          required: false,
          placeholder: '+1 (555) 123-4567'
        }
      ]
    },
    {
      id: 'job-details',
      name: 'Job Information',
      description: 'Enter job-related information',
      formFields: [
        { 
          key: 'job_title', 
          label: 'Job Title', 
          type: 'text', 
          required: true 
        },
        { 
          key: 'start_date', 
          label: 'Start Date', 
          type: 'date', 
          required: true 
        },
        { 
          key: 'salary', 
          label: 'Annual Salary', 
          type: 'number', 
          required: false,
          placeholder: '50000'
        }
      ]
    },
    {
      id: 'confirmation',
      name: 'Confirmation',
      description: 'Review and confirm your information',
      formFields: []
    }
  ],
  availableInCertificates: true,
  locked: false,
  created: new Date(),
  updated: new Date()
};

// Crear flow group y flow:
const { createFlowGroup, createFlow } = useFlowService();

createFlowGroup('Human Resources');
createFlow(basicFlow, 'Human Resources');
```

### Flow con Validación Avanzada

```typescript
const advancedField: FormField = {
  key: 'password',
  label: 'Password',
  type: 'password',
  required: true,
  validation: {
    minLength: 8,
    maxLength: 50,
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
  },
  placeholder: 'Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char'
};
```

---

## 3. Configurar Cascading Selects

### Ejemplo: Country → State → City

```typescript
const locationStep: FlowStep = {
  id: 'location-selection',
  name: 'Location Selection',
  description: 'Choose your location',
  formFields: [
    // Level 1: Country (no dependency)
    {
      key: 'country',
      label: 'Country',
      type: 'select',
      required: true,
      queryName: 'GET_COUNTRIES'
    },
    
    // Level 2: State (depends on country)
    {
      key: 'state',
      label: 'State/Province',
      type: 'select',
      required: true,
      queryName: 'GET_STATES_BY_COUNTRY',
      dependencyKey: 'country'  // ← Dependency
    },
    
    // Level 3: City (depends on state)
    {
      key: 'city',
      label: 'City',
      type: 'select',
      required: true,
      queryName: 'GET_CITIES_BY_STATE',
      dependencyKey: 'state'  // ← Dependency
    }
  ]
};

// Queries necesarias:
const queries = [
  {
    name: 'GET_COUNTRIES',
    isCatalog: true,
    parameters: [],
    // Returns: [{ value: 'us', label: 'United States' }, ...]
  },
  {
    name: 'GET_STATES_BY_COUNTRY',
    isCatalog: true,
    parameters: [
      { key: 'countryCode', label: 'Country Code', type: 'string', required: true }
    ],
    // Returns: [{ value: 'ca', label: 'California' }, ...]
  },
  {
    name: 'GET_CITIES_BY_STATE',
    isCatalog: true,
    parameters: [
      { key: 'stateCode', label: 'State Code', type: 'string', required: true }
    ],
    // Returns: [{ value: 'sf', label: 'San Francisco' }, ...]
  }
];
```

### Lógica en DynamicForm.tsx

```typescript
// Cuando un campo cambia:
const handleFieldChange = async (key: string, value: any) => {
  // 1. Actualizar valor
  setFormData({ ...formData, [key]: value });
  
  // 2. Buscar campos dependientes
  const dependentFields = step.formFields.filter(
    field => field.dependencyKey === key && field.queryName
  );
  
  // 3. Cargar opciones para dependientes
  for (const depField of dependentFields) {
    if (value) {
      // Cargar opciones
      const options = await fetchOptions(
        depField.queryName,
        { [key]: value }
      );
      setFieldOptions(prev => ({ 
        ...prev, 
        [depField.key]: options 
      }));
    } else {
      // Limpiar opciones
      setFieldOptions(prev => ({ 
        ...prev, 
        [depField.key]: [] 
      }));
    }
    
    // 4. Resetear valor del dependiente
    setFormData(prev => ({ 
      ...prev, 
      [depField.key]: undefined 
    }));
  }
};
```

---

## 4. Configurar Query Chains

### Ejemplo: Enrollment con Course Assignment

```typescript
const enrollmentStep: FlowStep = {
  id: 'student-enrollment',
  name: 'Student Enrollment',
  description: 'Enroll student and assign default course',
  formFields: [
    { key: 'faculty', label: 'Faculty', type: 'select', required: true, queryName: 'GET_FACULTIES' },
    { key: 'career', label: 'Career', type: 'select', required: true, queryName: 'GET_CAREERS_BY_FACULTY', dependencyKey: 'faculty' },
    { key: 'level', label: 'Level', type: 'select', required: true, queryName: 'GET_LEVELS_BY_CAREER', dependencyKey: 'career' },
    { key: 'student_name', label: 'Full Name', type: 'text', required: true },
    { key: 'student_email', label: 'Email', type: 'email', required: true }
  ],
  queryChain: [
    // Query 1: Create student
    {
      queryName: 'FINAL_STUDENT_ENROLLMENT',
      resultKey: 'enrollmentResult',
      parameters: {
        faculty: 'payload.faculty',
        career: 'payload.career',
        level: 'payload.level',
        student_name: 'payload.student_name',
        student_email: 'payload.student_email'
      }
    },
    // Query 2: Assign course (uses result from Query 1)
    {
      queryName: 'ASSIGN_DEFAULT_COURSE',
      resultKey: 'courseAssignmentResult',
      parameters: {
        studentId: 'results.enrollmentResult.studentId',  // ← From previous query
        level: 'payload.level'
      }
    },
    // Query 3: Send welcome email
    {
      queryName: 'SEND_WELCOME_EMAIL',
      resultKey: 'emailResult',
      parameters: {
        email: 'payload.student_email',
        studentId: 'results.enrollmentResult.studentId',
        courseName: 'results.courseAssignmentResult.courseName'
      }
    }
  ]
};
```

### Ejecución de Query Chain

```typescript
// En useFlowService.ts:
const executeQueryChain = async (
  chain: QueryChainAction[],
  payload: Record<string, any>
): Promise<any> => {
  const results: Record<string, any> = {};
  
  console.log('Starting query chain execution:', { chain, payload });
  
  for (const [index, action] of chain.entries()) {
    console.log(`Executing query ${index + 1}/${chain.length}: ${action.queryName}`);
    
    // Resolver parámetros dinámicamente
    const resolvedParams = resolveParameters(
      action.parameters,
      payload,
      results
    );
    
    console.log('Resolved parameters:', resolvedParams);
    
    try {
      // Ejecutar query
      const result = await executeQuery(action.queryName, resolvedParams);
      
      // Guardar resultado
      results[action.resultKey] = result;
      
      console.log(`Query ${action.queryName} completed:`, result);
    } catch (error) {
      console.error(`Query ${action.queryName} failed:`, error);
      throw new Error(`Query chain failed at step ${index + 1}: ${error.message}`);
    }
  }
  
  console.log('Query chain completed successfully:', results);
  return results;
};

// Resolver parámetros:
const resolveParameters = (
  paramMappings: Record<string, string>,
  payload: any,
  resultsContext: any
): Record<string, any> => {
  const resolved: Record<string, any> = {};
  
  for (const [key, mapping] of Object.entries(paramMappings)) {
    // mapping puede ser: "payload.faculty" o "results.enrollmentResult.studentId"
    const [source, ...pathParts] = mapping.split('.');
    const path = pathParts.join('.');
    
    let value;
    if (source === 'payload') {
      value = getValueByPath(payload, path);
    } else if (source === 'results') {
      value = getValueByPath(resultsContext, path);
    } else {
      throw new Error(`Invalid parameter source: "${source}". Use "payload" or "results".`);
    }
    
    if (value === undefined) {
      console.warn(`Could not resolve value for mapping "${mapping}"`);
    }
    
    resolved[key] = value;
  }
  
  return resolved;
};

// Helper para navegar objetos anidados:
const getValueByPath = (obj: any, path: string): any => {
  return path.split('.').reduce(
    (current, part) => current?.[part],
    obj
  );
};
```

---

## 5. Usar Hooks Personalizados

### useFlowService

```typescript
import { useFlowService } from './hooks/useFlowService';

function MyComponent() {
  const {
    flowGroups,
    flows,
    flowState,
    
    // CRUD
    createFlowGroup,
    createFlow,
    updateFlow,
    deleteFlow,
    toggleFlowLock,
    
    // Steps
    createStep,
    updateStep,
    reorderSteps,
    
    // Fields
    addFormField,
    updateFormField,
    deleteFormField,
    reorderFields,
    
    // Execution
    startFlow,
    advanceFlow,
    regressFlow,
    fetchOptions
  } = useFlowService();
  
  // Crear grupo
  const handleCreateGroup = () => {
    const success = createFlowGroup('My New Group');
    if (success) {
      toast.success('Group created');
    } else {
      toast.error('Group already exists');
    }
  };
  
  // Crear flow
  const handleCreateFlow = () => {
    const newFlow: Flow = {
      id: 'my-flow',
      name: 'My Flow',
      description: 'Description',
      steps: [],
      created: new Date(),
      updated: new Date()
    };
    
    createFlow(newFlow, 'My New Group');
  };
  
  // Agregar step
  const handleAddStep = (flowId: string) => {
    const newStep: FlowStep = {
      id: 'step-1',
      name: 'First Step',
      description: 'Description',
      formFields: []
    };
    
    createStep(flowId, newStep);
  };
  
  // Reordenar steps (drag-and-drop)
  const handleReorderSteps = (flowId: string, fromIndex: number, toIndex: number) => {
    reorderSteps(flowId, fromIndex, toIndex);
  };
  
  return (
    <div>
      <button onClick={handleCreateGroup}>Create Group</button>
      {flowGroups.map(group => (
        <div key={group.category}>
          <h3>{group.category}</h3>
          {group.flows.map(flow => (
            <div key={flow.id}>{flow.name}</div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

### useQueryManager

```typescript
import { useQueryManager } from './hooks/useQueryManager';

function QueryManager() {
  const {
    queries,
    createQuery,
    updateQuery,
    deleteQuery,
    toggleQueryLock,
    executeQuery
  } = useQueryManager();
  
  // Crear query
  const handleCreateQuery = () => {
    const newQuery: CustomQuery = {
      name: 'GET_USERS',
      description: 'Get all users',
      targetEndpoint: 'GET_USERS',
      isCatalog: true,
      parameters: [],
      locked: false
    };
    
    const result = createQuery(newQuery);
    if (result.success) {
      toast.success('Query created');
    } else {
      toast.error(result.error);
    }
  };
  
  // Ejecutar query
  const handleExecuteQuery = async () => {
    try {
      const result = await executeQuery('GET_USERS', {});
      console.log('Query result:', result);
    } catch (error) {
      console.error('Query failed:', error);
      toast.error(error.message);
    }
  };
  
  // Bloquear/desbloquear
  const handleToggleLock = (queryName: string) => {
    toggleQueryLock(queryName);
  };
  
  return (
    <div>
      <button onClick={handleCreateQuery}>Create Query</button>
      {queries.map(query => (
        <div key={query.name}>
          {query.name}
          {query.locked && <span>🔒</span>}
          <button onClick={() => handleToggleLock(query.name)}>
            {query.locked ? 'Unlock' : 'Lock'}
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 6. Implementar Drag-and-Drop

### Setup básico con react-dnd

```typescript
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <YourComponents />
    </DndProvider>
  );
}
```

### Componente Draggable

```typescript
import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { GripVertical } from 'lucide-react';

const ItemTypes = {
  CARD: 'card'
};

interface DraggableCardProps {
  id: string;
  index: number;
  text: string;
  moveCard: (fromIndex: number, toIndex: number) => void;
}

const DraggableCard: React.FC<DraggableCardProps> = ({ 
  id, 
  index, 
  text, 
  moveCard 
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // useDrag hook
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // useDrop hook
  const [, drop] = useDrop({
    accept: ItemTypes.CARD,
    hover: (draggedItem: { id: string; index: number }) => {
      if (!ref.current) return;
      
      const dragIndex = draggedItem.index;
      const hoverIndex = index;
      
      // No hacer nada si es el mismo elemento
      if (dragIndex === hoverIndex) return;
      
      // Mover el elemento
      moveCard(dragIndex, hoverIndex);
      
      // Actualizar index del elemento arrastrado
      draggedItem.index = hoverIndex;
    },
  });

  // Combinar drag y drop refs
  drag(drop(ref));

  return (
    <div 
      ref={ref}
      style={{ 
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move'
      }}
      className="border rounded p-4 mb-2 bg-white"
    >
      <div className="flex items-center gap-2">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
        <span>{text}</span>
      </div>
    </div>
  );
};

// Uso:
function DraggableList() {
  const [items, setItems] = useState([
    { id: '1', text: 'Item 1' },
    { id: '2', text: 'Item 2' },
    { id: '3', text: 'Item 3' },
  ]);

  const moveCard = (fromIndex: number, toIndex: number) => {
    const newItems = [...items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    setItems(newItems);
  };

  return (
    <div>
      {items.map((item, index) => (
        <DraggableCard
          key={item.id}
          id={item.id}
          index={index}
          text={item.text}
          moveCard={moveCard}
        />
      ))}
    </div>
  );
}
```

### Drag-and-Drop con Restricciones

```typescript
const DraggableStep: React.FC<Props> = ({ 
  step, 
  index, 
  isLocked,  // ← Restricción
  onMove 
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'STEP',
    item: { index },
    canDrag: !isLocked,  // ← No se puede arrastrar si está locked
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'STEP',
    canDrop: () => !isLocked,  // ← No se puede soltar si está locked
    hover: (item: { index: number }) => {
      if (item.index !== index && !isLocked) {
        onMove(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div ref={drag(drop(ref))}>
      <GripVertical 
        className={isLocked ? 'text-muted cursor-not-allowed' : 'text-primary cursor-grab'}
      />
      {step.name}
      {isLocked && <Lock className="w-4 h-4" />}
    </div>
  );
};
```

---

## 🎯 Best Practices

### 1. Validación Consistente

```typescript
// Siempre validar en el hook, no en el componente
const handleSave = () => {
  if (!formData.name || !formData.description) {
    toast.error('Name and description are required');
    return;
  }
  
  if (!/^[A-Z0-9_]+$/.test(formData.name)) {
    toast.error('Invalid name format');
    return;
  }
  
  // Guardar...
};
```

### 2. Feedback Visual

```typescript
// Siempre mostrar loading y resultado
const handleExecute = async () => {
  setLoading(true);
  try {
    const result = await executeQuery('QUERY_NAME', params);
    toast.success('Query executed successfully');
    return result;
  } catch (error) {
    toast.error(`Query failed: ${error.message}`);
  } finally {
    setLoading(false);
  }
};
```

### 3. Memoización

```typescript
// Usar useMemo para computaciones costosas
const publishedFlows = useMemo(() => {
  return flowGroups
    .map(group => ({
      ...group,
      flows: group.flows.filter(f => f.availableInCertificates)
    }))
    .filter(group => group.flows.length > 0);
}, [flowGroups]);

// Usar useCallback para funciones pasadas como props
const handleMove = useCallback((from: number, to: number) => {
  reorderSteps(flowId, from, to);
}, [flowId, reorderSteps]);
```

### 4. Error Handling

```typescript
try {
  const result = await operation();
  // Success path
} catch (error) {
  // Log error
  console.error('Operation failed:', error);
  
  // User feedback
  toast.error(
    error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred'
  );
  
  // Optional: Rollback state
  revertState();
}
```

---

## 📚 Referencias

- **React DnD**: https://react-dnd.github.io/react-dnd/
- **ShadCN UI**: https://ui.shadcn.com/
- **Lucide Icons**: https://lucide.dev/
- **TypeScript**: https://www.typescriptlang.org/

---

**Última actualización**: 2025-10-05  
**Versión**: 1.0

