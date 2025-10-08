# 📖 Guía de Uso - Plataforma Low-Code

## 🚀 Inicio Rápido

### Navegar la Aplicación

La plataforma tiene 4 pestañas principales:

```
┌────────────────────────────────────────────────────┐
│ Overview | Certificates | All Flows | Backoffice  │
└────────────────────────────────────────────────────┘
```

---

## 🎯 Tab 1: Overview

**Descripción**: Dashboard con estadísticas y acceso rápido

**Funcionalidades**:
- Ver número total de flows, queries y steps
- Enlaces rápidos a Certificates y Backoffice
- Descripción de características de la plataforma

**Uso recomendado**: Punto de entrada para nuevos usuarios

---

## 📜 Tab 2: Certificates

**Descripción**: Dashboard público para ejecutar procesos publicados

### Cómo usar:
1. Navega a la pestaña "Certificates"
2. Verás flows agrupados por categoría (Human Resources, Academics, etc.)
3. Cada flow muestra:
   - Nombre y descripción
   - Número de pasos
   - Badge "Published"
4. Haz clic en **"Start Process"** para ejecutar

### Ejemplo de flujo:
```
1. Click "Start Process" en "Student Enrollment"
2. Se abre modal con el paso 1: "Program Selection"
3. Selecciona Faculty → Career → Level (cascada)
4. Click "Next"
5. Completa "Student Details"
6. El sistema ejecuta query chain automáticamente
7. Ver resultados finales
```

**Nota**: Solo aparecen flows con `availableInCertificates: true`

---

## 📋 Tab 3: All Flows

**Descripción**: Lista completa de flows con opciones de ejecución

### Cómo usar:
1. Navega a "All Flows"
2. Explora flows agrupados por categoría
3. Cada card muestra:
   - Nombre del flow
   - Descripción
   - Número de pasos
   - Badge "Locked" si está bloqueado
   - Badge "Published" si está en Certificates
4. **"Run Flow"**: Ejecutar el flow
5. **Icono de ojo**: Ir a Backoffice para ver/editar

### Filtros y organización:
- Flows agrupados por categoría
- Indicadores visuales de estado
- Acceso rápido a ejecución

---

## 🏢 Tab 4: Backoffice

**Descripción**: Panel administrativo para diseñar flows y queries

### Sub-pestañas:

#### 🔹 Flows (FlowDesigner con Drag & Drop)

**Layout de 3 columnas**:
```
┌──────────┬───────────────┬──────────────────┐
│ Groups   │    Steps      │   Properties     │
│ & Flows  │  (Draggable)  │   & Fields       │
└──────────┴───────────────┴──────────────────┘
```

##### Crear un Flow Completo:

**1. Crear un FlowGroup**
```
1. Click "New Group"
2. Ingresa nombre (ej: "Human Resources")
3. Click "Save"
```

**2. Crear un Flow**
```
1. Click "+" en el grupo deseado
2. Completa:
   - Flow ID: "employee-onboarding"
   - Name: "Employee Onboarding"
   - Description: "Process for new employees"
   - Toggle "Publish to Certificates" si es público
3. Click "Save Flow"
```

**3. Agregar Steps**
```
1. Con el flow seleccionado, click "Add Step"
2. En el panel derecho:
   - Step ID: "personal-info"
   - Name: "Personal Information"
   - Description: "Enter employee details"
3. (Opcional) Configurar Query Chain:
   - Click "Add Query"
   - Select query: "CREATE_EMPLOYEE"
   - Result key: "employeeResult"
4. Click "Save"
```

**4. Agregar Fields a un Step**
```
1. Expande el step (click en chevron)
2. Click "Add Field"
3. En el panel derecho:
   - Key: "full_name"
   - Label: "Full Name"
   - Type: "text"
   - Check "Required"
   - Placeholder: "Enter full name"
4. Click "Save"
```

**5. Configurar Select Dinámico (Catalog Query)**
```
1. Add Field con type "select"
2. Key: "department"
3. Label: "Department"
4. Type: "select"
5. Query: "GET_DEPARTMENTS" (debe ser catalog query)
6. Click "Save"
```

**6. Configurar Cascading Select**
```
1. Primer select (parent):
   - Key: "faculty"
   - Query: "GET_FACULTIES"

2. Segundo select (dependiente):
   - Key: "career"
   - Query: "GET_CAREERS_BY_FACULTY"
   - Dependency Field: "faculty"  ← Esto crea la cascada
```

##### Drag & Drop:

**Reordenar Steps:**
```
1. Agarra el icono ⋮⋮ (GripVertical) del step
2. Arrastra arriba o abajo
3. Suelta en la posición deseada
4. El orden se actualiza automáticamente
```

**Reordenar Fields:**
```
1. Expande el step
2. Agarra el icono ⋮⋮ del field
3. Arrastra dentro del mismo step
4. Suelta para cambiar orden
```

**Nota**: No puedes hacer drag si el flow está locked (🔒)

##### Bloquear/Desbloquear Flow:

```
1. Selecciona el flow
2. Click en icono de candado (🔒/🔓)
3. Flow locked:
   - ❌ No se puede editar
   - ❌ No se puede eliminar
   - ❌ No hay drag-and-drop
   - ✅ Se puede ejecutar
```

---

#### 🔹 Queries (QueryDesigner)

**Layout de 2 columnas**:
```
┌─────────────┬────────────────────┐
│  Queries    │   Details/Form     │
│  List       │                    │
└─────────────┴────────────────────┘
```

##### Crear una Query:

**1. Catalog Query (para dropdowns)**
```
1. Click "New Query"
2. Completa:
   - Name: "GET_DEPARTMENTS"  (UPPER_SNAKE_CASE)
   - Description: "List all departments"
   - Target Endpoint: "GET_DEPARTMENTS" o "/api/departments"
   - Toggle ON: "Catalog Query (for dropdowns)"
3. Add Parameters (opcional):
   - Click "Add Parameter"
   - Key: "companyId"
   - Label: "Company ID"
   - Type: "string"
   - Check "Required"
4. Click "Save"
```

**2. Final Query (para query chains)**
```
1. Click "New Query"
2. Completa:
   - Name: "CREATE_EMPLOYEE"
   - Description: "Create new employee record"
   - Target Endpoint: "CREATE_EMPLOYEE"
   - Toggle OFF: Catalog Query
3. Add Parameters:
   - full_name (string, required)
   - email (string, required)
   - department (string, required)
4. Click "Save"
```

##### Editar Query:
```
1. Click en la query de la lista
2. Click "Edit"
3. Modifica campos
4. Add/Remove parámetros
5. Click "Save"
```

##### Eliminar Query:
```
1. Click icono de basura en la query
2. Confirma en el AlertDialog
3. Query eliminada (si no está locked)
```

##### Bloquear Query:
```
1. Selecciona la query
2. Click "Lock" o "Unlock"
3. Query locked no se puede editar/eliminar
```

---

## 🔄 Flujos de Trabajo Completos

### Escenario 1: Proceso de Inscripción de Estudiantes

**Objetivo**: Crear un flow que inscriba un estudiante y le asigne un curso

#### Paso 1: Crear Queries Necesarias

```
1. GET_FACULTIES (Catalog)
   - Sin parámetros
   - Retorna: [{ value: 'sci', label: 'Science' }, ...]

2. GET_CAREERS_BY_FACULTY (Catalog)
   - Parámetro: facultyId (string, required)
   - Retorna: [{ value: 'bio', label: 'Biology' }, ...]

3. GET_LEVELS_BY_CAREER (Catalog)
   - Parámetro: careerId (string, required)
   - Retorna: [{ value: '100', label: '100 Level' }, ...]

4. FINAL_STUDENT_ENROLLMENT (Final)
   - Parámetros: faculty, career, level, student_name, student_email
   - Retorna: { studentId: "STU-123", ... }

5. ASSIGN_DEFAULT_COURSE (Final)
   - Parámetro: studentId (string, required)
   - Retorna: { courseAssignmentId: "CAS-456", ... }
```

#### Paso 2: Crear Flow

```
1. Group: "Academics"
2. Flow:
   - ID: "student-enrollment"
   - Name: "Student Enrollment & Course Assignment"
   - Description: "Enroll student and assign default course"
   - Published: true
```

#### Paso 3: Crear Step 1 - Program Selection

```
Step:
  - ID: "program-selection"
  - Name: "Program Selection"
  - Description: "Choose faculty, career, and level"

Fields:
  1. faculty
     - Type: select
     - Query: GET_FACULTIES
     - Required: true

  2. career
     - Type: select
     - Query: GET_CAREERS_BY_FACULTY
     - Dependency: faculty  ← Cascada
     - Required: true

  3. level
     - Type: select
     - Query: GET_LEVELS_BY_CAREER
     - Dependency: career  ← Cascada
     - Required: true
```

#### Paso 4: Crear Step 2 - Student Details

```
Step:
  - ID: "student-details"
  - Name: "Student Details & Enrollment"
  - Description: "Enter student info and enroll"

Fields:
  1. student_name
     - Type: text
     - Required: true

  2. student_email
     - Type: email
     - Required: true

Query Chain:
  1. Query: FINAL_STUDENT_ENROLLMENT
     Result Key: enrollmentResult
     Parameters:
       - faculty: payload.faculty
       - career: payload.career
       - level: payload.level
       - student_name: payload.student_name
       - student_email: payload.student_email

  2. Query: ASSIGN_DEFAULT_COURSE
     Result Key: courseAssignmentResult
     Parameters:
       - studentId: results.enrollmentResult.studentId  ← Usa resultado anterior
```

#### Paso 5: Crear Step 3 - Confirmation

```
Step:
  - ID: "enrollment-summary"
  - Name: "Summary"
  - Description: "Enrollment complete"

Fields: (ninguno, solo confirmación)
```

#### Paso 6: Ejecutar el Flow

```
1. Ir a "Certificates"
2. Buscar "Student Enrollment & Course Assignment"
3. Click "Start Process"
4. Completar Step 1:
   - Faculty: Science
   - Career: Biology (se carga automáticamente)
   - Level: 100 Level (se carga automáticamente)
5. Click "Next"
6. Completar Step 2:
   - Name: "John Doe"
   - Email: "john@example.com"
7. Click "Next"
8. Sistema ejecuta query chain:
   - Crea estudiante → Obtiene studentId
   - Asigna curso usando studentId
9. Ver resultados en Step 3
```

---

### Escenario 2: Solicitud de Vacaciones

**Objetivo**: Flow simple sin query chain

#### Queries:
```
(Ninguna necesaria para este ejemplo)
```

#### Flow:
```
Group: "Human Resources"
Flow: "Leave Request"
```

#### Steps:

**Step 1: Request Details**
```
Fields:
  - startDateTime (datetime-local, required)
  - endDateTime (datetime-local, required)
```

**Step 2: Reason**
```
Fields:
  - reason (textarea, optional)
```

**Step 3: Summary**
```
Fields: (ninguno)
```

---

## 🎨 Tips y Mejores Prácticas

### Nomenclatura

**Queries**:
```
✅ GET_USERS
✅ CREATE_EMPLOYEE
✅ UPDATE_STUDENT_STATUS
❌ getUsers (minúsculas)
❌ Get-Users (guiones)
```

**Flow IDs**:
```
✅ user-onboarding
✅ employee-leave-request
❌ UserOnboarding (camelCase)
❌ user_onboarding (underscores)
```

**Field Keys**:
```
✅ full_name
✅ student_email
✅ start_date
❌ fullName (camelCase en campos de formulario puede causar confusión)
```

### Organización

**FlowGroups**:
```
- Human Resources
- Academics
- IT Support
- Finance
- Operations
```

**Queries Catalog vs Final**:
```
Catalog (para dropdowns):
  - GET_COUNTRIES
  - GET_DEPARTMENTS
  - GET_FACULTIES

Final (para query chains):
  - CREATE_USER
  - UPDATE_STATUS
  - GENERATE_CERTIFICATE
```

### Cascading Selects

**Estructura recomendada**:
```
Parent → Child → Grandchild

Example:
  country (GET_COUNTRIES)
    ↓
  state (GET_STATES_BY_COUNTRY, dependency: country)
    ↓
  city (GET_CITIES_BY_STATE, dependency: state)
```

### Query Chains

**Orden de ejecución**:
```
1. Query que crea/obtiene ID
2. Queries que usan ese ID
3. Query final de confirmación

Example:
  1. CREATE_ORDER → orderId
  2. ADD_ITEMS(orderId)
  3. SEND_CONFIRMATION_EMAIL(orderId)
```

**Mapeo de parámetros**:
```
✅ payload.fieldKey         (desde formulario)
✅ results.resultKey.value  (desde query anterior)
❌ hardcoded values         (evitar)
```

---

## 🐛 Troubleshooting

### Problema: "Query name must be in UPPER_SNAKE_CASE"
**Solución**: Usa solo mayúsculas, números y underscores
```
❌ getUsers
✅ GET_USERS
```

### Problema: No puedo editar un flow
**Solución**: El flow está locked. Click en el candado para desbloquearlo

### Problema: Los selects en cascada no cargan opciones
**Solución**: 
1. Verifica que el campo parent tenga un queryName
2. Verifica que el campo child tenga:
   - queryName configurado
   - dependencyKey apuntando al campo parent

### Problema: Query chain falla
**Solución**:
1. Verifica el mapeo de parámetros
2. Asegúrate que results.resultKey.field existe
3. Revisa console logs para ver qué query falló

### Problema: No puedo hacer drag-and-drop
**Solución**:
1. Verifica que el flow no esté locked
2. Asegúrate de agarrar el icono ⋮⋮ (GripVertical)
3. Los fields solo se pueden reordenar dentro del mismo step

---

## 📚 Referencia Rápida

### Iconos y Significados

| Icono | Significado |
|-------|-------------|
| 🔒 Lock | Item bloqueado (no editable) |
| 🔓 Unlock | Item desbloqueado (editable) |
| ⋮⋮ GripVertical | Arrastrable (drag handle) |
| ✏️ Edit | Editar |
| 🗑️ Trash | Eliminar |
| 👁️ Eye | Ver/Preview |
| ▶️ Play | Ejecutar flow |
| ➕ Plus | Agregar nuevo |
| 💾 Save | Guardar |
| ❌ X | Cancelar |
| ℹ️ Info | Badge informativo |

### Badges

| Badge | Significado |
|-------|-------------|
| **Locked** | Flow/Query bloqueado |
| **Published** | Disponible en Certificates |
| **Catalog** | Query para dropdowns |
| **Required** | Campo obligatorio |
| **Dynamic** | Select con query |
| **X steps** | Número de pasos |
| **X fields** | Número de campos |

### Estados de Flow

| Estado | Descripción |
|--------|-------------|
| **Draft** | Flow en edición (no publicado) |
| **Published** | Disponible en Certificates |
| **Locked** | No se puede editar |
| **Running** | En ejecución |
| **Completed** | Ejecutado exitosamente |

---

## 🎓 Recursos Adicionales

### Documentación del Proyecto
- `MIGRATION_PLAN.md` - Plan detallado de implementación
- `IMPLEMENTATION_COMPLETE.md` - Resumen de implementación

### Componentes Clave
- `FlowDesignerDnD.tsx` - Diseñador visual de flows
- `QueryDesigner.tsx` - Diseñador de queries
- `CertificatesDashboard.tsx` - Dashboard público
- `DynamicForm.tsx` - Formularios dinámicos

### Hooks
- `useFlowService` - Gestión de flows y steps
- `useQueryManager` - Gestión de queries
- `useFlowExecution` - Ejecución de flows

---

**Última actualización**: 2025-10-05  
**Versión**: 1.0

