import { useState, useCallback, useMemo } from 'react';
import { AutomatedFlow, FlowTrigger, AutomatedFlowExecution, TriggerStatus, Flow } from '../types/flow';
import { useFlowService } from './useFlowService';

// Mock data for automated flows
const MOCK_AUTOMATED_FLOWS: AutomatedFlow[] = [
  {
    id: 'auto-user-welcome',
    name: 'Automated User Welcome',
    description: 'Automatically welcome new users when they register',
    isAutomated: true,
    status: 'active',
    triggers: [
      {
        type: 'database',
        tableName: 'users',
        operation: 'insert',
        debounceMs: 5000
      }
    ],
    steps: [
      {
        id: 'send-welcome-email',
        name: 'Send Welcome Email',
        description: 'Send personalized welcome email to new user',
        formFields: [
          {
            key: 'emailTemplate',
            label: 'Email Template',
            type: 'select',
            required: true,
            options: [
              { value: 'standard', label: 'Standard Welcome' },
              { value: 'premium', label: 'Premium Welcome' },
              { value: 'corporate', label: 'Corporate Welcome' }
            ]
          }
        ],
        queryChain: [
          {
            queryName: 'send-email',
            resultKey: 'emailResult',
            parameters: {
              to: 'trigger.data.email',
              template: 'payload.emailTemplate',
              userName: 'trigger.data.name'
            }
          }
        ]
      }
    ],
    executionHistory: [],
    lastExecution: new Date(Date.now() - 3600000), // 1 hour ago
    nextExecution: undefined,
    parameters: {
      delayMinutes: {
        type: 'number',
        defaultValue: 5,
        required: false,
        description: 'Delay before sending welcome email (minutes)'
      }
    },
    notifications: {
      onFailure: ['admin@company.com']
    }
  },
  {
    id: 'auto-daily-reports',
    name: 'Daily Activity Reports',
    description: 'Generate and send daily activity reports',
    isAutomated: true,
    status: 'active',
    triggers: [
      {
        type: 'schedule',
        frequency: 'daily',
        startDate: new Date(),
        time: '09:00',
        timezone: 'UTC'
      }
    ],
    steps: [
      {
        id: 'generate-report',
        name: 'Generate Activity Report',
        description: 'Generate daily activity summary',
        formFields: [
          {
            key: 'reportType',
            label: 'Report Type',
            type: 'select',
            required: true,
            options: [
              { value: 'summary', label: 'Summary Report' },
              { value: 'detailed', label: 'Detailed Report' },
              { value: 'analytics', label: 'Analytics Report' }
            ]
          }
        ],
        queryChain: [
          {
            queryName: 'generate-daily-report',
            resultKey: 'reportData',
            parameters: {
              date: 'system.currentDate',
              type: 'payload.reportType'
            }
          }
        ]
      }
    ],
    executionHistory: [],
    lastExecution: new Date(Date.now() - 86400000), // 24 hours ago
    nextExecution: new Date(Date.now() + 3600000), // 1 hour from now
    maxConcurrentExecutions: 1,
    timeoutMs: 300000, // 5 minutes
    notifications: {
      onFailure: ['admin@company.com'],
      onSuccess: ['reports@company.com']
    }
  }
];

// Mock execution history
const MOCK_EXECUTIONS: AutomatedFlowExecution[] = [
  {
    id: 'exec-1',
    flowId: 'auto-user-welcome',
    triggerId: 'trigger-1',
    status: 'completed',
    startTime: new Date(Date.now() - 3600000),
    endTime: new Date(Date.now() - 3580000),
    duration: 20000,
    triggeredBy: {
      type: 'database',
      tableName: 'users',
      operation: 'insert'
    },
    inputData: { userId: '12345', email: 'user@example.com' },
    outputData: { emailSent: true, emailId: 'email-123' }
  },
  {
    id: 'exec-2',
    flowId: 'auto-daily-reports',
    triggerId: 'trigger-2',
    status: 'failed',
    startTime: new Date(Date.now() - 86400000),
    endTime: new Date(Date.now() - 86390000),
    duration: 10000,
    triggeredBy: {
      type: 'schedule',
      frequency: 'daily',
      startDate: new Date(),
      time: '09:00'
    },
    errorMessage: 'Database connection timeout',
    retryCount: 2
  }
];

export interface UseAutomatedFlows {
  automatedFlows: AutomatedFlow[];
  executions: AutomatedFlowExecution[];
  isLoading: boolean;
  error: string | null;
  
  // Flow management
  createAutomatedFlow: (flow: Omit<AutomatedFlow, 'id' | 'executionHistory' | 'isAutomated'>) => Promise<string>;
  updateAutomatedFlow: (id: string, updates: Partial<AutomatedFlow>) => Promise<void>;
  deleteAutomatedFlow: (id: string) => Promise<void>;
  
  // Trigger management
  addTrigger: (flowId: string, trigger: FlowTrigger) => Promise<void>;
  updateTrigger: (flowId: string, triggerIndex: number, trigger: FlowTrigger) => Promise<void>;
  removeTrigger: (flowId: string, triggerIndex: number) => Promise<void>;
  
  // Flow control
  activateFlow: (flowId: string) => Promise<void>;
  pauseFlow: (flowId: string) => Promise<void>;
  disableFlow: (flowId: string) => Promise<void>;
  
  // Execution management
  getExecutions: (flowId?: string) => AutomatedFlowExecution[];
  manualTrigger: (flowId: string, inputData?: any) => Promise<string>;
  cancelExecution: (executionId: string) => Promise<void>;
  retryExecution: (executionId: string) => Promise<void>;
  
  // Utility functions
  getActiveFlows: () => AutomatedFlow[];
  getFlowsByTriggerType: (triggerType: string) => AutomatedFlow[];
  getUpcomingExecutions: () => { flow: AutomatedFlow; nextExecution: Date }[];
  convertFlowToAutomated: (flow: Flow) => Promise<string>;
}

export const useAutomatedFlows = (): UseAutomatedFlows => {
  const [automatedFlows, setAutomatedFlows] = useState<AutomatedFlow[]>(MOCK_AUTOMATED_FLOWS);
  const [executions, setExecutions] = useState<AutomatedFlowExecution[]>(MOCK_EXECUTIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { flows } = useFlowService();

  const createAutomatedFlow = useCallback(async (flowData: Omit<AutomatedFlow, 'id' | 'executionHistory' | 'isAutomated'>): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newFlow: AutomatedFlow = {
        ...flowData,
        id: `auto-flow-${Date.now()}`,
        isAutomated: true,
        executionHistory: [],
        status: 'active'
      };
      
      setAutomatedFlows(prev => [...prev, newFlow]);
      return newFlow.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create automated flow');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateAutomatedFlow = useCallback(async (id: string, updates: Partial<AutomatedFlow>): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      setAutomatedFlows(prev => prev.map(flow => 
        flow.id === id ? { ...flow, ...updates } : flow
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update automated flow');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteAutomatedFlow = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      setAutomatedFlows(prev => prev.filter(flow => flow.id !== id));
      setExecutions(prev => prev.filter(exec => exec.flowId !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete automated flow');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTrigger = useCallback(async (flowId: string, trigger: FlowTrigger): Promise<void> => {
    await updateAutomatedFlow(flowId, {
      triggers: [...(automatedFlows.find(f => f.id === flowId)?.triggers || []), trigger]
    });
  }, [automatedFlows, updateAutomatedFlow]);

  const updateTrigger = useCallback(async (flowId: string, triggerIndex: number, trigger: FlowTrigger): Promise<void> => {
    const flow = automatedFlows.find(f => f.id === flowId);
    if (!flow) return;
    
    const newTriggers = [...flow.triggers];
    newTriggers[triggerIndex] = trigger;
    
    await updateAutomatedFlow(flowId, { triggers: newTriggers });
  }, [automatedFlows, updateAutomatedFlow]);

  const removeTrigger = useCallback(async (flowId: string, triggerIndex: number): Promise<void> => {
    const flow = automatedFlows.find(f => f.id === flowId);
    if (!flow) return;
    
    const newTriggers = flow.triggers.filter((_, index) => index !== triggerIndex);
    await updateAutomatedFlow(flowId, { triggers: newTriggers });
  }, [automatedFlows, updateAutomatedFlow]);

  const activateFlow = useCallback(async (flowId: string): Promise<void> => {
    await updateAutomatedFlow(flowId, { status: 'active' });
  }, [updateAutomatedFlow]);

  const pauseFlow = useCallback(async (flowId: string): Promise<void> => {
    await updateAutomatedFlow(flowId, { status: 'paused' });
  }, [updateAutomatedFlow]);

  const disableFlow = useCallback(async (flowId: string): Promise<void> => {
    await updateAutomatedFlow(flowId, { status: 'disabled' });
  }, [updateAutomatedFlow]);

  const getExecutions = useCallback((flowId?: string): AutomatedFlowExecution[] => {
    if (flowId) {
      return executions.filter(exec => exec.flowId === flowId);
    }
    return executions;
  }, [executions]);

  const manualTrigger = useCallback(async (flowId: string, inputData?: any): Promise<string> => {
    const executionId = `manual-exec-${Date.now()}`;
    const newExecution: AutomatedFlowExecution = {
      id: executionId,
      flowId,
      triggerId: 'manual',
      status: 'pending',
      startTime: new Date(),
      triggeredBy: { type: 'manual' } as any,
      inputData
    };
    
    setExecutions(prev => [newExecution, ...prev]);
    
    // Simulate execution
    setTimeout(() => {
      setExecutions(prev => prev.map(exec => 
        exec.id === executionId 
          ? { ...exec, status: 'completed', endTime: new Date(), duration: 5000 }
          : exec
      ));
    }, 5000);
    
    return executionId;
  }, []);

  const cancelExecution = useCallback(async (executionId: string): Promise<void> => {
    setExecutions(prev => prev.map(exec => 
      exec.id === executionId ? { ...exec, status: 'cancelled' } : exec
    ));
  }, []);

  const retryExecution = useCallback(async (executionId: string): Promise<void> => {
    const execution = executions.find(exec => exec.id === executionId);
    if (!execution) return;
    
    const newExecutionId = `retry-${executionId}-${Date.now()}`;
    const newExecution: AutomatedFlowExecution = {
      ...execution,
      id: newExecutionId,
      status: 'pending',
      startTime: new Date(),
      endTime: undefined,
      duration: undefined,
      errorMessage: undefined,
      retryCount: (execution.retryCount || 0) + 1
    };
    
    setExecutions(prev => [newExecution, ...prev]);
  }, [executions]);

  const getActiveFlows = useCallback((): AutomatedFlow[] => {
    return automatedFlows.filter(flow => flow.status === 'active');
  }, [automatedFlows]);

  const getFlowsByTriggerType = useCallback((triggerType: string): AutomatedFlow[] => {
    return automatedFlows.filter(flow => 
      flow.triggers.some(trigger => trigger.type === triggerType)
    );
  }, [automatedFlows]);

  const getUpcomingExecutions = useCallback((): { flow: AutomatedFlow; nextExecution: Date }[] => {
    return automatedFlows
      .filter(flow => flow.nextExecution)
      .map(flow => ({ flow, nextExecution: flow.nextExecution! }))
      .sort((a, b) => a.nextExecution.getTime() - b.nextExecution.getTime());
  }, [automatedFlows]);

  const convertFlowToAutomated = useCallback(async (flow: Flow): Promise<string> => {
    const automatedFlow = {
      ...flow,
      triggers: [],
      status: 'paused' as TriggerStatus,
      maxConcurrentExecutions: 1,
      timeoutMs: 300000
    };
    
    return await createAutomatedFlow(automatedFlow);
  }, [createAutomatedFlow]);

  return {
    automatedFlows,
    executions,
    isLoading,
    error,
    
    createAutomatedFlow,
    updateAutomatedFlow,
    deleteAutomatedFlow,
    
    addTrigger,
    updateTrigger,
    removeTrigger,
    
    activateFlow,
    pauseFlow,
    disableFlow,
    
    getExecutions,
    manualTrigger,
    cancelExecution,
    retryExecution,
    
    getActiveFlows,
    getFlowsByTriggerType,
    getUpcomingExecutions,
    convertFlowToAutomated
  };
};