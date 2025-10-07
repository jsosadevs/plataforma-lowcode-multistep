export interface FormFieldOption {
  value: string | number;
  label: string;
}

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'time' | 'datetime-local';
  required: boolean;
  options?: FormFieldOption[]; 
  queryName?: string; 
  dependencyKey?: string; 
}

export interface QueryChainAction {
  queryName: string;
  resultKey: string; 
  parameters: { [key: string]: string };
}

export interface FlowStep {
  stepId: string;
  title: string;
  description: string;
  formFields: FormField[];
  queryChain?: QueryChainAction[]; 
}

export interface Flow {
  id: string;
  name: string;
  description: string;
  steps: FlowStep[];
  locked?: boolean;
  availableInCertificates?: boolean; // New property
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