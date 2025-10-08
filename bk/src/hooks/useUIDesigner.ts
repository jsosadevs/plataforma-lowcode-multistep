import { useState, useEffect, useCallback } from 'react';
import { Flow, FlowUIConfig, StepUIConfig, FieldUIConfig } from '../types/flow';

export interface UIDesignerState {
  localFlow: Flow | null;
  selectedStep: string | null;
  activeTab: string;
  isDirty: boolean;
  deviceMode: 'desktop' | 'tablet' | 'mobile';
  showPreviewPane: boolean;
  layoutPreset: string;
}

export interface UIDesignerActions {
  updateFlowUIConfig: (config: Partial<FlowUIConfig>) => void;
  updateStepUIConfig: (stepId: string, config: Partial<StepUIConfig>) => void;
  updateFieldUIConfig: (stepId: string, fieldKey: string, config: Partial<FieldUIConfig>) => void;
  reorderStepFields: (stepId: string, reorderedFields: any[]) => void;
  setSelectedStep: (stepId: string | null) => void;
  setActiveTab: (tab: string) => void;
  setDeviceMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  setShowPreviewPane: (show: boolean) => void;
  setLayoutPreset: (preset: string) => void;
  resetChanges: () => void;
  markDirty: () => void;
}

/**
 * Central hook for managing UI Designer state and actions
 * Separates state management from UI rendering
 */
export function useUIDesigner(flow: Flow | null, isOpen: boolean) {
  const [state, setState] = useState<UIDesignerState>({
    localFlow: null,
    selectedStep: null,
    activeTab: 'templates',
    isDirty: false,
    deviceMode: 'desktop',
    showPreviewPane: true,
    layoutPreset: 'sidebar-left'
  });

  // Initialize flow with default layout configuration
  useEffect(() => {
    if (flow && isOpen) {
      const flowWithLayout = {
        ...flow,
        uiConfig: {
          ...flow.uiConfig,
          layout: flow.uiConfig?.layout || {
            preset: 'sidebar-left',
            customLayout: false,
            fullscreen: false,
            modalBehaviour: 'responsive' as const,
            areas: []
          }
        }
      };

      setState(prev => ({
        ...prev,
        localFlow: flowWithLayout,
        selectedStep: flow.steps.length > 0 ? flow.steps[0].id : null,
        layoutPreset: flowWithLayout.uiConfig.layout?.preset || 'sidebar-left',
        isDirty: false
      }));
    }
  }, [flow, isOpen]);

  // Update flow UI configuration
  const updateFlowUIConfig = useCallback((config: Partial<FlowUIConfig>) => {
    setState(prev => {
      if (!prev.localFlow) return prev;

      return {
        ...prev,
        localFlow: {
          ...prev.localFlow,
          uiConfig: { ...prev.localFlow.uiConfig, ...config }
        },
        isDirty: true
      };
    });
  }, []);

  // Update step UI configuration
  const updateStepUIConfig = useCallback((stepId: string, config: Partial<StepUIConfig>) => {
    setState(prev => {
      if (!prev.localFlow) return prev;

      return {
        ...prev,
        localFlow: {
          ...prev.localFlow,
          steps: prev.localFlow.steps.map(step =>
            step.id === stepId
              ? { ...step, uiConfig: { ...step.uiConfig, ...config } }
              : step
          )
        },
        isDirty: true
      };
    });
  }, []);

  // Update field UI configuration
  const updateFieldUIConfig = useCallback((stepId: string, fieldKey: string, config: Partial<FieldUIConfig>) => {
    setState(prev => {
      if (!prev.localFlow) return prev;

      return {
        ...prev,
        localFlow: {
          ...prev.localFlow,
          steps: prev.localFlow.steps.map(step =>
            step.id === stepId
              ? {
                ...step,
                formFields: step.formFields.map(field =>
                  field.key === fieldKey
                    ? { ...field, uiConfig: { ...field.uiConfig, ...config } }
                    : field
                )
              }
              : step
          )
        },
        isDirty: true
      };
    });
  }, []);

  // Reorder step fields
  const reorderStepFields = useCallback((stepId: string, reorderedFields: any[]) => {
    setState(prev => {
      if (!prev.localFlow) return prev;

      return {
        ...prev,
        localFlow: {
          ...prev.localFlow,
          steps: prev.localFlow.steps.map(step =>
            step.id === stepId
              ? { ...step, formFields: reorderedFields }
              : step
          )
        },
        isDirty: true
      };
    });
  }, []);

  // Simple setters
  const setSelectedStep = useCallback((stepId: string | null) => {
    setState(prev => ({ ...prev, selectedStep: stepId }));
  }, []);

  const setActiveTab = useCallback((tab: string) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const setDeviceMode = useCallback((mode: 'desktop' | 'tablet' | 'mobile') => {
    setState(prev => ({ ...prev, deviceMode: mode }));
  }, []);

  const setShowPreviewPane = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showPreviewPane: show }));
  }, []);

  const setLayoutPreset = useCallback((preset: string) => {
    setState(prev => ({ ...prev, layoutPreset: preset }));
  }, []);

  const resetChanges = useCallback(() => {
    if (flow) {
      setState(prev => ({
        ...prev,
        localFlow: { ...flow },
        isDirty: false
      }));
    }
  }, [flow]);

  const markDirty = useCallback(() => {
    setState(prev => ({ ...prev, isDirty: true }));
  }, []);

  const actions: UIDesignerActions = {
    updateFlowUIConfig,
    updateStepUIConfig,
    updateFieldUIConfig,
    reorderStepFields,
    setSelectedStep,
    setActiveTab,
    setDeviceMode,
    setShowPreviewPane,
    setLayoutPreset,
    resetChanges,
    markDirty
  };

  return { state, actions };
}
