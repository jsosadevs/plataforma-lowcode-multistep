// Core data models for the Low-Code Flow platform

// ============================================
// AUTOMATED FLOWS TYPES
// ============================================

export type TriggerType = 'database' | 'schedule' | 'webhook' | 'manual' | 'recurring';
export type ScheduleFrequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
export type TriggerStatus = 'active' | 'paused' | 'disabled' | 'error';

export interface DatabaseTrigger {
  type: 'database';
  tableName: string;
  operation: 'insert' | 'update' | 'delete' | 'any';
  conditions?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
    value: any;
  }[];
  debounceMs?: number; // Prevent rapid firing
}

export interface ScheduleTrigger {
  type: 'schedule';
  frequency: ScheduleFrequency;
  startDate: Date;
  endDate?: Date;
  time?: string; // HH:MM format
  timezone?: string;
  cronExpression?: string; // For custom schedules
  weekdays?: number[]; // 0-6, for weekly schedules
  monthDay?: number; // 1-31, for monthly schedules
}

export interface WebhookTrigger {
  type: 'webhook';
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH';
  headers?: { [key: string]: string };
  authentication?: {
    type: 'none' | 'bearer' | 'basic' | 'api_key';
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
    apiKeyHeader?: string;
  };
}

export interface RecurringTrigger {
  type: 'recurring';
  interval: number; // in minutes
  maxExecutions?: number;
  retryPolicy?: {
    maxRetries: number;
    retryDelayMs: number;
    backoffMultiplier?: number;
  };
}

export type FlowTrigger = DatabaseTrigger | ScheduleTrigger | WebhookTrigger | RecurringTrigger;

export interface AutomatedFlowExecution {
  id: string;
  flowId: string;
  triggerId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  duration?: number; // in milliseconds
  triggeredBy: FlowTrigger;
  inputData?: any;
  outputData?: any;
  errorMessage?: string;
  retryCount?: number;
  logs?: {
    timestamp: Date;
    level: 'info' | 'warn' | 'error';
    message: string;
    stepId?: string;
  }[];
}

export interface AutomatedFlow extends Flow {
  isAutomated: true;
  triggers: FlowTrigger[];
  executionHistory: AutomatedFlowExecution[];
  lastExecution?: Date;
  nextExecution?: Date;
  status: TriggerStatus;
  maxConcurrentExecutions?: number;
  timeoutMs?: number;
  parameters?: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'date';
      defaultValue?: any;
      required: boolean;
      description?: string;
    };
  };
  notifications?: {
    onSuccess?: string[]; // Email addresses
    onFailure?: string[];
    onStart?: string[];
  };
}

export interface FormFieldOption {
  value: string | number;
  label: string;
}

export interface QueryParameter {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date';
  required: boolean;
}

export interface CustomQuery {
  name: string;
  description: string;
  targetEndpoint: string;
  isCatalog: boolean;
  parameters: QueryParameter[];
  locked?: boolean;
  mockResponse?: any; // For development/testing
}

export interface QueryChainAction {
  queryName: string;
  resultKey: string;
  parameters: { [key: string]: string }; // Maps like 'faculty': 'payload.faculty' or 'studentId': 'results.enrollmentResult.studentId'
}

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'time' | 'datetime-local' | 'checkbox';
  required?: boolean;
  options?: FormFieldOption[];
  queryName?: string; // For dynamic selects
  dependencyKey?: string; // For cascading selects
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
  placeholder?: string;
  helpText?: string; // Help text for info tooltip
  icon?: string; // Icon name from lucide-react
  // Enhanced contextual information
  purpose?: string; // Detailed purpose explanation
  examples?: string[]; // Usage examples
  formatting?: string; // Format requirements
  validationRules?: string[]; // Human-readable validation rules
  // UI Configuration
  uiConfig?: FieldUIConfig;
}

export interface FlowStep {
  id: string;
  name: string;
  description?: string;
  formFields: FormField[];
  queryChain?: QueryChainAction[];
  allowBack?: boolean;
  allowSkip?: boolean;
  // Enhanced detailed information
  helpText?: string;
  estimatedTime?: string;
  requirements?: string[];
  tips?: string[];
  warnings?: string[];
  // Custom info area enhancements
  objectives?: string[];
  keyPoints?: string[];
  examples?: string[];
  bestPractices?: string[];
  commonMistakes?: string[];
  relatedSteps?: string[];
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  prerequisites?: string[];
  customInfo?: {
    enabled?: boolean;
    objectives?: string[];
    keyPoints?: string[];
    examples?: string[];
    bestPractices?: string[];
    commonMistakes?: string[];
    relatedSteps?: string[];
    tags?: string[];
    estimatedDuration?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    prerequisites?: string[];
  };
  // UI Configuration
  uiConfig?: StepUIConfig;
}

export interface Flow {
  id: string;
  name: string;
  description: string;
  steps: FlowStep[];
  locked?: boolean;
  availableInCertificates?: boolean;
  created?: Date;
  updated?: Date;
  // Custom info area configuration at flow level
  customInfo?: {
    enabled?: boolean;
    objectives?: string[];
    keyPoints?: string[];
    examples?: string[];
    bestPractices?: string[];
    commonMistakes?: string[];
    relatedSteps?: string[];
    tags?: string[];
    estimatedDuration?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    prerequisites?: string[];
  };
  // UI Configuration
  uiConfig?: FlowUIConfig;
}

export interface FlowGroup {
  category: string;
  flows: Flow[];
}

export interface FlowState {
  status: 'loading' | 'ready' | 'completed' | 'error' | 'final-result';
  currentStep?: FlowStep;
  currentStepIndex?: number;
  completedStepsPayload: { [key: string]: any };
  error?: string;
  flowId?: string;
  finalQueryResult?: any;
}

export interface AdvanceFlowPayload {
  flowId: string;
  currentStepId: string;
  payload: { [key: string]: any };
}



// Builder types for the Flow Designer
export interface DragItem {
  type: 'FORM_FIELD' | 'FLOW_STEP';
  data: FormField | FlowStep;
}

export interface DropTarget {
  type: 'STEP_CONTAINER' | 'FIELD_CONTAINER';
  stepId?: string;
  index?: number;
}

// UI Configuration Types
export type ViewMode = 'default' | 'cards' | 'grid' | 'compact' | 'minimal' | 'wizard';
export type FieldLayout = 'single' | 'two-column' | 'three-column' | 'auto' | 'inline';
export type ColorTheme = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type SpacingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface FieldUIConfig {
  width?: 'full' | 'half' | 'third' | 'quarter' | 'auto';
  order?: number;
  hidden?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'filled' | 'underlined';
}

export interface StepUIConfig {
  viewMode?: ViewMode;
  fieldLayout?: FieldLayout;
  columns?: number;
  spacing?: SpacingSize;
  showProgress?: boolean;
  showDescription?: boolean;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: SpacingSize;
  padding?: SpacingSize;
  animation?: 'none' | 'fade' | 'slide' | 'scale';
}

export interface FlowUIConfig {
  theme?: ColorTheme;
  accentColor?: string;
  primaryColor?: string;
  borderRadius?: SpacingSize;
  animation?: 'none' | 'smooth' | 'fast' | 'slow';
  modalSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showSidebar?: boolean;
  sidebarPosition?: 'left' | 'right';
  progressStyle?: 'bar' | 'dots' | 'steps' | 'none';
  headerStyle?: 'default' | 'compact' | 'detailed' | 'minimal';
  // Layout variant specific styling
  sidebarBackground?: string;
  sidebarBorder?: string;
  sidebarText?: string;
  mainBackground?: string;
  mainPadding?: SpacingSize;
  mainBorderRadius?: SpacingSize;
  layout?: {
    preset?: string;
    areas?: LayoutArea[];
    fullscreen?: boolean;
    customLayout?: boolean;
    modalBehaviour?: 'fixed' | 'responsive' | 'fullscreen';
  };
}

export interface LayoutVariantConfig {
  layoutId: string; // e.g., 'sidebar-left', 'three-panel', etc.
  accentColor?: string;
  primaryColor?: string;
  backgroundColor?: string;
  sidebarStyle?: {
    background?: string;
    borderColor?: string;
    textColor?: string;
  };
  mainContentStyle?: {
    background?: string;
    padding?: SpacingSize;
    borderRadius?: SpacingSize;
  };
  headerStyle?: 'default' | 'compact' | 'detailed' | 'minimal';
  progressPosition?: 'sidebar' | 'header' | 'inline';
}

export interface UITemplate {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'creative' | 'technical' | 'simple';
  preview?: string;
  layoutPreset: string; // Default layout preset ID
  flowConfig: FlowUIConfig;
  stepConfig: StepUIConfig;
  fieldConfig?: FieldUIConfig;
  layoutVariants?: LayoutVariantConfig[]; // Configuraciones específicas por layout
}

// Layout Configuration Types
export interface LayoutArea {
  id: string;
  name: string;
  component: 'sidebar' | 'main' | 'header' | 'footer' | 'navigation' | 'toolbar';
  visible: boolean;
  position: 'left' | 'right' | 'top' | 'bottom' | 'center';
  size: number; // Percentage or fixed pixels
  sizeUnit: 'percentage' | 'pixels' | 'auto';
  order: number;
  collapsible?: boolean;
  resizable?: boolean;
  minSize?: number;
  maxSize?: number;
  content?: 'progress' | 'steps' | 'navigation' | 'form' | 'preview' | 'custom';
}

export interface LayoutPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'classic' | 'modern' | 'minimal' | 'advanced';
  areas: LayoutArea[];
  modalSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'custom';
  fullscreen?: boolean;
  responsive?: boolean;
}