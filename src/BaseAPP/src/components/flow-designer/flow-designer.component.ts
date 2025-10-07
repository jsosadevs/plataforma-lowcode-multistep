import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { FlowService } from '../../services/flow.service';
import { QueryManagerService } from '../../services/query-manager.service';
import { Flow, FlowStep, FormField, QueryChainAction } from '../../models/flow.model';

@Component({
  selector: 'app-flow-designer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './flow-designer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlowDesignerComponent {
  private flowService = inject(FlowService);
  private queryManager = inject(QueryManagerService);
  private fb: FormBuilder = inject(FormBuilder);

  flowGroups = this.flowService.flowGroups;
  availableQueries = computed(() => this.queryManager.getAvailableQueries());
  catalogQueries = computed(() => this.availableQueries().filter(q => q.isCatalog));
  finalQueries = computed(() => this.availableQueries().filter(q => !q.isCatalog));

  // State
  selectedFlowId = signal<string | null>(null);
  selectedStepId = signal<string | null>(null);
  
  editingFlow = signal<Flow | null>(null);
  editingStep = signal<FlowStep | null>(null);
  editingField = signal<FormField | null>(null);
  
  isCreating = signal(false);
  isCreatingGroup = signal(false);
  newFlowCategory = signal<string | null>(null);

  // State for delete confirmation
  showDeleteFlowConfirm = signal(false);
  flowToDelete = signal<{ flow: Flow, category: string } | null>(null);

  // Drag and Drop State
  draggedStepIndex = signal<number | null>(null);
  draggedFieldIndex = signal<number | null>(null);

  // UI State
  actionsMenuOpenForFlow = signal<string | null>(null);
  collapsedState = signal<{ [key: string]: boolean }>({});


  // Computed properties
  selectedFlow = computed(() => {
    const id = this.selectedFlowId();
    if (!id) return null;
    return this.flowGroups().flatMap(g => g.flows).find(f => f.id === id) ?? null;
  });

  selectedStep = computed(() => {
    const id = this.selectedStepId();
    if (!id) return null;
    return this.selectedFlow()?.steps.find(s => s.stepId === id) ?? null;
  });

  // Forms
  flowForm: FormGroup;
  stepForm: FormGroup;
  fieldForm: FormGroup;
  groupForm: FormGroup;

  fieldTypes: FormField['type'][] = ['text', 'email', 'password', 'number', 'date', 'select', 'textarea', 'time', 'datetime-local'];

  constructor() {
    this.flowForm = this.fb.group({
      id: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      name: ['', Validators.required],
      description: [''],
      availableInCertificates: [false]
    });

    this.stepForm = this.fb.group({
      stepId: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      title: ['', Validators.required],
      description: [''],
      queryChain: this.fb.array([])
    });

    this.fieldForm = this.fb.group({
      key: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      label: ['', Validators.required],
      type: ['text', Validators.required],
      required: [false],
      queryName: [''],
      dependencyKey: [''],
    });

    this.groupForm = this.fb.group({
      category: ['', Validators.required]
    });
  }

  // --- UI State Management ---
  toggleGroupCollapse(category: string): void {
    const key = `group_${category}`;
    this.collapsedState.update(state => ({ ...state, [key]: !state[key] }));
  }

  toggleStepsCollapse(flowId: string): void {
    const key = `steps_${flowId}`;
    this.collapsedState.update(state => ({ ...state, [key]: !state[key] }));
  }
  
  toggleFieldsCollapse(stepId: string): void {
    const key = `fields_${stepId}`;
    this.collapsedState.update(state => ({ ...state, [key]: !state[key] }));
  }

  // --- Selection ---
  selectFlow(flowId: string | null): void {
    if (this.selectedFlow()?.locked && this.editingField()) {
        this.cancelEdit();
    }
    this.selectedFlowId.set(flowId);
    this.selectedStepId.set(null);
    this.cancelEdit();
  }

  selectStep(stepId: string | null): void {
    this.selectedStepId.set(stepId);
    this.cancelEdit();
  }

  // --- UI Actions ---
  toggleActionsMenu(flowId: string): void {
    if (this.actionsMenuOpenForFlow() === flowId) {
      this.actionsMenuOpenForFlow.set(null);
    } else {
      this.actionsMenuOpenForFlow.set(flowId);
    }
  }

  // --- Group Actions ---
  startNewGroup(): void {
    this.groupForm.reset();
    this.isCreatingGroup.set(true);
    this.cancelEdit(); 
  }

  cancelNewGroup(): void {
    this.isCreatingGroup.set(false);
  }

  saveGroup(): void {
    if (this.groupForm.invalid) return;
    const { category } = this.groupForm.value;
    if (!this.flowService.createFlowGroup(category)) {
      alert(`A group with the name "${category}" already exists.`);
    }
    this.isCreatingGroup.set(false);
  }

  // --- Flow Actions ---
  startNewFlow(category: string): void {
    this.newFlowCategory.set(category);
    this.isCreating.set(true);
    this.editingFlow.set({ id: '', name: '', description: '', steps: [], availableInCertificates: false });
    this.flowForm.reset({ availableInCertificates: false });
    this.flowForm.get('id')?.enable();
  }

  startEditFlow(flow: Flow): void {
    if (flow.locked) return;
    this.isCreating.set(false);
    this.editingFlow.set(flow);
    this.flowForm.patchValue(flow);
    this.flowForm.get('id')?.disable();
  }

  saveFlow(): void {
    if (this.flowForm.invalid) return;

    const flowData = this.flowForm.getRawValue();
    if (this.isCreating()) {
      const category = this.newFlowCategory();
      if (category) {
        this.flowService.createFlow(flowData, category);
        this.selectFlow(flowData.id);
      }
    } else {
      const originalFlow = this.editingFlow();
      if (originalFlow) {
        const updatedFlow = { ...originalFlow, ...flowData };
        this.flowService.updateFlow(updatedFlow);
      }
    }
    this.cancelEdit();
  }
  
  requestDeleteFlow(flow: Flow, category: string): void {
    this.flowToDelete.set({ flow, category });
    this.showDeleteFlowConfirm.set(true);
  }

  cancelDeleteFlow(): void {
    this.flowToDelete.set(null);
    this.showDeleteFlowConfirm.set(false);
  }

  confirmDeleteFlow(): void {
    const toDelete = this.flowToDelete();
    if (toDelete) {
      this.flowService.deleteFlow(toDelete.flow.id, toDelete.category);
      if (this.selectedFlowId() === toDelete.flow.id) {
        this.selectFlow(null);
      }
    }
    this.cancelDeleteFlow();
  }

  toggleLock(flowId: string): void {
    this.flowService.toggleFlowLock(flowId);
    if (this.selectedFlowId() === flowId && this.selectedFlow()?.locked) {
        this.cancelEdit();
    }
  }

  // --- Step Actions ---
  startNewStep(): void {
    if (!this.selectedFlowId() || this.selectedFlow()?.locked) return;
    this.isCreating.set(true);
    this.editingStep.set({ stepId: '', title: '', description: '', formFields: [] });
    this.stepForm.reset();
    (this.stepForm.get('queryChain') as FormArray).clear();
    this.stepForm.get('stepId')?.enable();
  }

  startEditStep(step: FlowStep): void {
    if (!this.selectedFlowId() || this.selectedFlow()?.locked) return;
    this.isCreating.set(false);
    this.editingStep.set(step);
    this.stepForm.patchValue(step);
    this.stepForm.get('stepId')?.disable();
    
    const queryChainArray = this.stepForm.get('queryChain') as FormArray;
    queryChainArray.clear();
    step.queryChain?.forEach(action => queryChainArray.push(this.createQueryChainActionGroup(action)));
  }
  
  saveStep(): void {
    if (this.stepForm.invalid || !this.selectedFlowId()) return;
    const flowId = this.selectedFlowId()!;
    const stepData: FlowStep = this.stepForm.getRawValue();
    
    if (this.isCreating()) {
      this.flowService.createStep(flowId, stepData);
    } else {
      const originalStep = this.editingStep();
      if(originalStep) {
        stepData.formFields = originalStep.formFields;
      }
      this.flowService.updateStep(flowId, stepData);
    }
    this.selectStep(stepData.stepId);
    this.cancelEdit();
  }

  // --- Field Actions ---
  startNewField(): void {
    if (!this.selectedStepId() || this.selectedFlow()?.locked) return;
    this.isCreating.set(true);
    this.editingField.set({ key: '', label: '', type: 'text', required: false });
    this.fieldForm.reset({ type: 'text', required: false });
    this.fieldForm.get('key')?.enable();
  }

  startEditField(field: FormField): void {
    if (!this.selectedStepId() || this.selectedFlow()?.locked) return;
    this.isCreating.set(false);
    this.editingField.set(field);
    this.fieldForm.patchValue(field);
    this.fieldForm.get('key')?.disable();
  }

  saveField(): void {
    if (this.fieldForm.invalid || !this.selectedFlowId() || !this.selectedStepId()) return;
    const flowId = this.selectedFlowId()!;
    const stepId = this.selectedStepId()!;
    const fieldData = this.fieldForm.getRawValue();

    if (this.isCreating()) {
      this.flowService.addFormField(flowId, stepId, fieldData);
    } else {
      this.flowService.updateFormField(flowId, stepId, fieldData);
    }
    this.cancelEdit();
  }

  deleteField(fieldKey: string): void {
    if (!this.selectedFlowId() || !this.selectedStepId() || this.selectedFlow()?.locked) return;
    if (confirm(`Are you sure you want to delete the field "${fieldKey}"?`)) {
      this.flowService.deleteFormField(this.selectedFlowId()!, this.selectedStepId()!, fieldKey);
    }
  }

  cancelEdit(): void {
    this.editingFlow.set(null);
    this.editingStep.set(null);
    this.editingField.set(null);
    this.isCreating.set(false);
    this.newFlowCategory.set(null);
    this.actionsMenuOpenForFlow.set(null);
  }

  get queryChainActions(): FormArray {
    return this.stepForm.get('queryChain') as FormArray;
  }

  createQueryChainActionGroup(action: QueryChainAction | null = null): FormGroup {
    const group = this.fb.group({
      queryName: [action?.queryName || '', Validators.required],
      resultKey: [action?.resultKey || '', Validators.required],
      parameters: this.fb.group({})
    });

    if (action) {
      this.updateQueryActionParameters(action.queryName, group);
      (group.get('parameters') as FormGroup).patchValue(action.parameters);
    }
    
    group.get('queryName')?.valueChanges.subscribe(queryName => {
      this.updateQueryActionParameters(queryName, group);
    });

    return group;
  }

  updateQueryActionParameters(queryName: string, actionGroup: FormGroup): void {
    const paramsGroup = actionGroup.get('parameters') as FormGroup;
    
    Object.keys(paramsGroup.controls).forEach(key => paramsGroup.removeControl(key));
    
    const query = this.availableQueries().find(q => q.name === queryName);
    query?.parameters.forEach(param => {
      paramsGroup.addControl(param.key, this.fb.control('', Validators.required));
    });
  }

  addQueryChainAction(): void {
    this.queryChainActions.push(this.createQueryChainActionGroup());
  }

  removeQueryChainAction(index: number): void {
    this.queryChainActions.removeAt(index);
  }

  getQueryActionParameters(action: AbstractControl): string[] {
    const paramsGroup = action.get('parameters') as FormGroup;
    return Object.keys(paramsGroup.controls);
  }

  onStepDragStart(event: DragEvent, index: number): void {
    if (this.selectedFlow()?.locked) return;
    this.draggedStepIndex.set(index);
    event.dataTransfer!.effectAllowed = 'move';
  }

  onStepDrop(event: DragEvent, toIndex: number): void {
    event.preventDefault();
    const fromIndex = this.draggedStepIndex();
    const flowId = this.selectedFlowId();
    if (fromIndex !== null && flowId) {
      this.flowService.reorderSteps(flowId, fromIndex, toIndex);
    }
    this.draggedStepIndex.set(null);
  }

  onStepDragOver(event: DragEvent): void {
    if (this.selectedFlow()?.locked) return;
    event.preventDefault(); 
  }

  onStepDragEnd(): void {
    this.draggedStepIndex.set(null);
  }

  onFieldDragStart(event: DragEvent, index: number): void {
    if (this.selectedFlow()?.locked) return;
    this.draggedFieldIndex.set(index);
    event.dataTransfer!.effectAllowed = 'move';
  }

  onFieldDrop(event: DragEvent, toIndex: number): void {
    event.preventDefault();
    const fromIndex = this.draggedFieldIndex();
    const flowId = this.selectedFlowId();
    const stepId = this.selectedStepId();
    if (fromIndex !== null && flowId && stepId) {
      this.flowService.reorderFields(flowId, stepId, fromIndex, toIndex);
    }
    this.draggedFieldIndex.set(null);
  }

  onFieldDragOver(event: DragEvent): void {
    if (this.selectedFlow()?.locked) return;
    event.preventDefault();
  }

  onFieldDragEnd(): void {
    this.draggedFieldIndex.set(null);
  }
}
