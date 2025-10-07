import { useReducer, useCallback } from 'react';
import { Flow, FlowState, QueryChainAction } from '../types/flow';
import { useQueryManager } from './useQueryManager';

type FlowAction = 
  | { type: 'SET_CURRENT_STEP'; stepIndex: number }
  | { type: 'UPDATE_FORM_DATA'; stepIndex: number; fieldKey: string; value: any }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_ERROR'; error: string | undefined }
  | { type: 'SET_QUERY_RESULT'; queryName: string; result: any }
  | { type: 'COMPLETE_FLOW' }
  | { type: 'RESET_FLOW' };

const flowReducer = (state: FlowState, action: FlowAction): FlowState => {
  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return { ...state, currentStepIndex: action.stepIndex, error: undefined };
    
    case 'UPDATE_FORM_DATA':
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.stepIndex]: {
            ...state.formData[action.stepIndex],
            [action.fieldKey]: action.value
          }
        }
      };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };
    
    case 'SET_ERROR':
      return { ...state, error: action.error, isLoading: false };
    
    case 'SET_QUERY_RESULT':
      return {
        ...state,
        queryResults: {
          ...state.queryResults,
          [action.queryName]: action.result
        }
      };
    
    case 'COMPLETE_FLOW':
      return { ...state, completed: true, isLoading: false };
    
    case 'RESET_FLOW':
      return {
        currentStepIndex: 0,
        formData: {},
        queryResults: {},
        isLoading: false,
        error: undefined,
        completed: false
      };
    
    default:
      return state;
  }
};

export const useFlowExecution = (flow: Flow) => {
  const { executeQuery } = useQueryManager();
  
  const [state, dispatch] = useReducer(flowReducer, {
    currentStepIndex: 0,
    formData: {},
    queryResults: {},
    isLoading: false,
    completed: false
  });

  const _resolveParameters = useCallback((parameterMapping: { [key: string]: string }, stepIndex: number): { [key: string]: any } => {
    const resolvedParams: { [key: string]: any } = {};
    
    Object.entries(parameterMapping).forEach(([paramName, mappingValue]) => {
      if (mappingValue.startsWith('{') && mappingValue.endsWith('}')) {
        // Template string like "{firstName} {lastName}"
        let resolved = mappingValue;
        const fieldMatches = mappingValue.match(/{([^}]+)}/g);
        
        if (fieldMatches) {
          fieldMatches.forEach(match => {
            const fieldKey = match.slice(1, -1);
            const fieldValue = state.formData[stepIndex]?.[fieldKey] || '';
            resolved = resolved.replace(match, fieldValue);
          });
        }
        
        resolvedParams[paramName] = resolved.trim();
      } else {
        // Direct field mapping
        const value = state.formData[stepIndex]?.[mappingValue];
        if (value !== undefined) {
          resolvedParams[paramName] = value;
        }
      }
    });
    
    return resolvedParams;
  }, [state.formData]);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < flow.steps.length) {
      dispatch({ type: 'SET_CURRENT_STEP', stepIndex });
    }
  }, [flow.steps.length]);

  const goNext = useCallback(() => {
    if (state.currentStepIndex < flow.steps.length - 1) {
      dispatch({ type: 'SET_CURRENT_STEP', stepIndex: state.currentStepIndex + 1 });
    }
  }, [state.currentStepIndex, flow.steps.length]);

  const goBack = useCallback(() => {
    if (state.currentStepIndex > 0) {
      dispatch({ type: 'SET_CURRENT_STEP', stepIndex: state.currentStepIndex - 1 });
    }
  }, [state.currentStepIndex]);

  const updateFormData = useCallback((stepIndex: number, fieldKey: string, value: any) => {
    dispatch({ type: 'UPDATE_FORM_DATA', stepIndex, fieldKey, value });
  }, []);

  const executeQueryChain = useCallback(async (queryChain: QueryChainAction[]) => {
    dispatch({ type: 'SET_LOADING', isLoading: true });
    
    try {
      for (const action of queryChain) {
        const parameters = _resolveParameters(action.parameterMapping, state.currentStepIndex);
        const result = await executeQuery(action.queryName, parameters);
        dispatch({ type: 'SET_QUERY_RESULT', queryName: action.queryName, result });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', error: error instanceof Error ? error.message : 'Unknown error occurred' });
    } finally {
      dispatch({ type: 'SET_LOADING', isLoading: false });
    }
  }, [executeQuery, _resolveParameters, state.currentStepIndex]);

  const completeFlow = useCallback(() => {
    dispatch({ type: 'COMPLETE_FLOW' });
  }, []);

  const resetFlow = useCallback(() => {
    dispatch({ type: 'RESET_FLOW' });
  }, []);

  return {
    flow,
    state,
    goToStep,
    goNext,
    goBack,
    updateFormData,
    executeQueryChain,
    completeFlow,
    resetFlow
  };
};