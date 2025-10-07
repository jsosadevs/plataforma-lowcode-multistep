# UI Designer Architecture Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FlowUIDesignerRefactored                  │
│                     (Main Orchestrator)                      │
│                         ~200 lines                           │
└────────────┬──────────────────────────────────┬──────────────┘
             │                                  │
             │ Uses                             │ Uses
             ▼                                  ▼
    ┌────────────────┐                 ┌───────────────────┐
    │ useUIDesigner  │                 │useTemplateManager │
    │    (Hook)      │                 │     (Hook)        │
    │  ~200 lines    │                 │   ~100 lines      │
    └────────┬───────┘                 └─────────┬─────────┘
             │                                   │
             │ Provides                          │ Uses
             │ state + actions                   ▼
             │                          ┌────────────────────┐
             │                          │  ui-templates.ts   │
             │                          │  (Configuration)   │
             │                          │    ~300 lines      │
             │                          └────────────────────┘
             │
    ┌────────┴────────────────────────────────────────┐
    │                                                  │
    ▼                                                  ▼
┌─────────────────┐                        ┌──────────────────┐
│  Tab Components │                        │ Utility Components│
│                 │                        │                   │
│ • TemplatesTab  │                        │ • LayoutCustomizer│
│ • FlowConfigTab │                        │ • UIPreviewPane   │
│ • StepConfigTab │                        │ • FieldReorderTool│
│ • Fields (uses  │                        │ • LayoutEngine    │
│   existing)     │                        │                   │
│ • Layout (uses  │                        │                   │
│   existing)     │                        │                   │
└─────────────────┘                        └──────────────────┘
```

## Data Flow

```
┌────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                        │
└──────────────────────────┬─────────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   Tab Component        │
              │  (TemplatesTab, etc.)  │
              └───────────┬────────────┘
                          │
                          │ Calls action
                          ▼
              ┌────────────────────────┐
              │   useUIDesigner Hook   │
              │  (State Management)    │
              └───────────┬────────────┘
                          │
                          │ Updates state
                          ▼
              ┌────────────────────────┐
              │    Local Flow State    │
              └───────────┬────────────┘
                          │
                          │ Triggers re-render
                          ▼
              ┌────────────────────────┐
              │   Preview Updates      │
              │  (UIPreviewPane)       │
              └────────────────────────┘
```

## Template System Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                      LAYOUT_VARIANTS                           │
│                   (Shared Configuration)                       │
│                                                                 │
│  ┌───��──────────────┐  ┌──────────────────┐                   │
│  │ modern-sidebar-  │  │ minimal-full-    │                   │
│  │      left        │  │     width        │  ... more         │
│  │  • accentColor   │  │  • accentColor   │                   │
│  │  • primaryColor  │  │  • headerStyle   │                   │
│  │  • sidebarStyle  │  │  • mainContent   │                   │
│  └──────────────────┘  └──────────────────┘                   │
└─────────────┬─────────────────────────────────────────────────┘
              │
              │ Referenced by
              ▼
┌───────────────────────────────────────────────────────────────┐
│                     TEMPLATE_REGISTRY                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────┐          │
│  │  Template: "modern-card"                        │          │
│  │  • flowConfig                                   │          │
│  │  • stepConfig                                   │          │
│  │  • layoutVariants: [                            │          │
│  │      LAYOUT_VARIANTS['modern-sidebar-left'],    │          │
│  │      LAYOUT_VARIANTS['modern-sidebar-right'],   │          │
│  │      LAYOUT_VARIANTS['modern-three-panel']      │          │
│  │    ]                                            │          │
│  └─────────────────────────────────────────────────┘          │
│                                                                 │
│  ┌───────────────────────────────────────────────���─┐          │
│  │  Template: "minimal-list"                       │          │
│  │  • flowConfig                                   │          │
│  │  • stepConfig                                   │          │
│  │  • layoutVariants: [                            │          │
│  │      LAYOUT_VARIANTS['minimal-full-width'],     │          │
│  │      LAYOUT_VARIANTS['minimal-wizard']          │          │
│  │    ]                                            │          │
│  └─────────────────────────────────────────────────┘          │
└───────────────────────────────────────────────────────────────┘
```

## State Management Flow

```
┌────────────────────────────────────────────────────────┐
│                  useUIDesigner Hook                     │
│                                                          │
│  ┌───────────────────────────────────────────────���──┐  │
│  │                     STATE                         │  │
│  │  • localFlow: Flow | null                        │  │
│  │  • selectedStep: string | null                   │  │
│  │  • activeTab: string                             │  │
│  │  • isDirty: boolean                              │  │
│  │  • deviceMode: 'desktop' | 'tablet' | 'mobile'   │  │
│  │  • showPreviewPane: boolean                      │  │
│  │  • layoutPreset: string                          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │                   ACTIONS                         │  │
│  │  • updateFlowUIConfig(config)                    │  │
│  │  • updateStepUIConfig(stepId, config)            │  │
│  │  • updateFieldUIConfig(stepId, fieldKey, config) │  │
│  │  • reorderStepFields(stepId, fields)             │  │
│  │  • setSelectedStep(stepId)                       │  │
│  │  • setActiveTab(tab)                             │  │
│  │  • setDeviceMode(mode)                           │  │
│  │  • setShowPreviewPane(show)                      │  │
│  │  • setLayoutPreset(preset)                       │  │
│  │  • resetChanges()                                │  │
│  │  • markDirty()                                   │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
FlowUIDesignerRefactored
│
├── Dialog (fullscreen)
│   │
│   ├── Header Bar
│   │   ├── Title & Status
│   │   └── Action Buttons
│   │       ├── Preview
│   │       ├── Reset
│   │       ├── Save
│   │       └── Close
│   │
│   └── ResizablePanelGroup (horizontal)
│       │
│       ├── Configuration Panel
│       │   │
│       │   └── Tabs
│       │       ├── Templates
│       │       │   └── <TemplatesTab />
│       │       │       ├── Info Banner
│       │       │       └── Template Grid
│       │       │           └── Template Cards
│       │       │
│       │       ├── Flow Config
│       │       │   └── <FlowConfigTab />
│       │       │       ├── Modal Settings Card
│       │       │       └── Layout Settings Card
│       │       │
│       │       ├── Steps Config
│       │       │   └── <StepConfigTab />
│       │       │       ├── Step Selector
│       │       │       ├── View Mode Card
│       │       │       └── Spacing Card
│       │       │
│       │       ├── Fields Config
│       │       │   └── <FieldReorderTool />
│       │       │       └── Field List (drag-drop)
│       │       │
│       │       └── Layout Config
│       │           └── <LayoutCustomizer />
│       │               ├── Preset Selector
│       │               └── Custom Areas Editor
│       │
│       └── Preview Panel
│           │
│           ├── Preview Header
│           │   ├── Title
│           │   └── Hide Button
│           │
│           └── <UIPreviewPane />
│               ├── Device Mode Selector
│               └── Live Preview
│                   ├── Header Preview
│                   ├── Main Content Preview
│                   └── Footer Preview
│
└── FlowRunnerModal (for preview testing)
```

## File Dependencies

```
FlowUIDesignerRefactored.tsx
├── imports: useFlowService
├── imports: useUIDesigner ────────┐
├── imports: useTemplateManager ───┼───┐
├── imports: FlowRunnerModal       │   │
├── imports: UIPreviewPane         │   │
├── imports: FieldReorderTool      │   │
├── imports: LayoutCustomizer      │   │
├── imports: TemplatesTab          │   │
├── imports: FlowConfigTab         │   │
└── imports: StepConfigTab         │   │
                                   │   │
useUIDesigner.ts ◄─────────────────┘   │
├── manages: all state                 │
├── provides: 11 actions               │
└── dependencies: none (pure logic)    │
                                       │
useTemplateManager.ts ◄────────────────┘
├── imports: ui-templates.ts
├── provides: applyTemplate
├── provides: getTemplateVariants
└── provides: template queries
                │
                ▼
ui-templates.ts
├── exports: LAYOUT_VARIANTS
├── exports: TEMPLATE_REGISTRY
├── exports: getTemplateRegistry
├── exports: getLayoutVariant
└── exports: getAvailableLayoutPresets
```

## Comparison: Before vs After

### Before (Monolithic)

```
┌────────────────────────────────────────────┐
│       FlowUIDesigner.tsx (1200 lines)      │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  State (10+ useState)                │ │
│  │  • localFlow                         │ │
│  │  • selectedStep                      │ │
│  │  • activeTab                         │ │
│  │  • ... 7 more                        │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  UI_TEMPLATES (540 lines)            │ │
│  │  Inline data with duplication        │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  Logic Functions (200 lines)         │ │
│  │  • applyTemplate                     │ │
│  │  • updateFlowUIConfig                │ │
│  │  • updateStepUIConfig                │ │
│  │  • ... more                          │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  Inline Tab Components (400 lines)   │ │
│  │  • TemplatesTab()                    │ │
│  │  • FlowConfigTab()                   │ │
│  │  • StepConfigTab()                   │ │
│  │  • FieldsConfigTab()                 │ │
│  │  • LayoutTab()                       │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  └── Render (100 lines)                   │
└─────────────────────��──────────────────────┘
```

### After (Modular)

```
┌──────────────────────────────────────────────────────┐
│  FlowUIDesignerRefactored.tsx (200 lines)            │
│                                                       │
│  imports hooks ────────┬──────────┐                  │
│  imports components    │          │                  │
│  orchestrates flow     │          │                  │
└────────────────────────┼──────────┼──────────────────┘
                         │          │
        ┌────────────────┘          └─────────────┐
        ▼                                         ▼
┌──────────────────┐                    ┌─────────────────┐
│ useUIDesigner.ts │                    │useTemplateManager│
│   (200 lines)    │                    │    (100 lines)  │
│                  │                    │                 │
│ State + Actions  │                    │ Template Logic  │
└──────────────────┘                    └────────┬────────┘
                                                 │
                                                 ▼
                                    ┌──────────────────────┐
                                    │  ui-templates.ts     │
                                    │    (300 lines)       │
                                    │                      │
                                    │ Variants + Templates │
                                    └──────────────────────┘

┌──────────────────────────────────────────────────────┐
│  Tab Components (separate files)                     │
│                                                       │
│  • TemplatesTab.tsx      (~150 lines)                │
│  • FlowConfigTab.tsx     (~150 lines)                │
│  • StepConfigTab.tsx     (~180 lines)                │
│  • (Fields uses existing FieldReorderTool)           │
│  • (Layout uses existing LayoutCustomizer)           │
└─────────────────────���────────────────────────────────┘
```

## Key Architecture Decisions

### 1. Hook-Based State Management
- **Why**: Separation of concerns, testability
- **Result**: State logic reusable and isolated

### 2. Shared Layout Variants
- **Why**: DRY principle, reduce duplication
- **Result**: 60% less code, easier maintenance

### 3. Component Extraction
- **Why**: SRP, better file organization
- **Result**: Parallel development, clearer ownership

### 4. Configuration-Driven
- **Why**: Easier to extend, no code changes for new templates
- **Result**: Add templates by editing config only

### 5. Backward Compatible Interface
- **Why**: Drop-in replacement, no breaking changes
- **Result**: Easy migration, zero disruption

---

**Legend:**
- `│` : Hierarchy relationship
- `▼` : Data/control flow direction
- `◄` : Import/dependency relationship
- `┌─┐` : Component/module boundary
