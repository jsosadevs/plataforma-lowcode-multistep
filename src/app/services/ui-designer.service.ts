import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Flow, FlowUIConfig, StepUIConfig, FieldUIConfig } from '../models/flow.model';

/**
 * Interfaz que define el estado del diseñador de UI.
 */
export interface UIDesignerState {
  originalFlow: Flow | null; // Guardamos el flujo original para el reseteo
  localFlow: Flow | null;
  selectedStep: string | null;
  activeTab: string;
  isDirty: boolean;
  deviceMode: 'desktop' | 'tablet' | 'mobile';
  showPreviewPane: boolean;
  layoutPreset: string;
}

/**
 * Servicio para gestionar el estado y la lógica del diseñador de UI.
 * Reemplaza la funcionalidad del hook useUIDesigner del proyecto React.
 */
@Injectable({
  providedIn: 'root'
})
export class UiDesignerService {

  private readonly initialState: UIDesignerState = {
    originalFlow: null,
    localFlow: null,
    selectedStep: null,
    activeTab: 'templates',
    isDirty: false,
    deviceMode: 'desktop',
    showPreviewPane: true,
    layoutPreset: 'sidebar-left'
  };

  private readonly stateSubject = new BehaviorSubject<UIDesignerState>(this.initialState);

  /**
   * Observable público para que los componentes se suscriban a los cambios de estado.
   */
  public readonly state$: Observable<UIDesignerState> = this.stateSubject.asObservable();

  constructor() { }

  /**
   * Inicializa o resetea el estado del servicio con un flujo.
   * @param flow El flujo con el que se inicializará el diseñador.
   */
  public initializeState(flow: Flow): void {
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

    this.stateSubject.next({
      ...this.initialState,
      originalFlow: JSON.parse(JSON.stringify(flowWithLayout)), // Deep copy para el reseteo
      localFlow: JSON.parse(JSON.stringify(flowWithLayout)), // Deep copy para la edición
      selectedStep: flow.steps.length > 0 ? flow.steps[0].id : null,
      layoutPreset: flowWithLayout.uiConfig.layout?.preset || 'sidebar-left'
    });
  }

  /**
   * Actualiza la configuración de UI a nivel de flujo.
   * @param config Un objeto parcial con la configuración a actualizar.
   */
  public updateFlowUIConfig(config: Partial<FlowUIConfig>): void {
    const currentState = this.stateSubject.getValue();
    if (!currentState.localFlow) return;

    const newFlow = {
      ...currentState.localFlow,
      uiConfig: { ...currentState.localFlow.uiConfig, ...config }
    };

    this.stateSubject.next({ ...currentState, localFlow: newFlow, isDirty: true });
  }

  /**
   * Actualiza la configuración de UI de un paso específico.
   * @param stepId El ID del paso a actualizar.
   * @param config Un objeto parcial con la configuración a actualizar.
   */
  public updateStepUIConfig(stepId: string, config: Partial<StepUIConfig>): void {
    const currentState = this.stateSubject.getValue();
    if (!currentState.localFlow) return;

    const newFlow = {
      ...currentState.localFlow,
      steps: currentState.localFlow.steps.map(step =>
        step.id === stepId
          ? { ...step, uiConfig: { ...step.uiConfig, ...config } }
          : step
      )
    };

    this.stateSubject.next({ ...currentState, localFlow: newFlow, isDirty: true });
  }

  // Métodos adicionales para replicar las otras acciones (setSelectedStep, setActiveTab, etc.)

  public setSelectedStep(stepId: string | null): void {
    this.stateSubject.next({ ...this.stateSubject.getValue(), selectedStep: stepId });
  }

  public setActiveTab(tab: string): void {
    this.stateSubject.next({ ...this.stateSubject.getValue(), activeTab: tab });
  }

  public setDeviceMode(mode: 'desktop' | 'tablet' | 'mobile'): void {
    this.stateSubject.next({ ...this.stateSubject.getValue(), deviceMode: mode });
  }

  /**
   * Resetea los cambios al estado original del flujo.
   */
  public resetChanges(): void {
    const currentState = this.stateSubject.getValue();
    this.stateSubject.next({
      ...currentState,
      localFlow: currentState.originalFlow ? JSON.parse(JSON.stringify(currentState.originalFlow)) : null,
      isDirty: false
    });
  }
}