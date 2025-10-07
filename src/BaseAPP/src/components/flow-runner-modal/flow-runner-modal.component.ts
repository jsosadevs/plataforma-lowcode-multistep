import { Component, ChangeDetectionStrategy, input, output, effect, inject, computed, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Flow, FlowState, FormField, FormFieldOption } from '../../models/flow.model';
import { FlowService } from '../../services/flow.service';

const initialFlowState: FlowState = {
  status: 'loading',
  completedStepsPayload: {}
};

@Component({
  selector: 'app-flow-runner-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './flow-runner-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlowRunnerModalComponent {
  flow = input.required<Flow | null>();
  closeModal = output<void>();

  private fb: FormBuilder = inject(FormBuilder);
  private flowService = inject(FlowService);
  private destroyRef = inject(DestroyRef);

  dynamicForm: FormGroup = this.fb.group({});
  flowState = toSignal(this.flowService.flowState$, { initialValue: initialFlowState });

  // Signals for dynamic select options and their loading states
  fieldOptions = signal<{ [key: string]: FormFieldOption[] }>({});
  fieldLoading = signal<{ [key: string]: boolean }>({});

  private stepSubscriptions$ = new Subject<void>();

  // Computed properties for step navigation
  steps = computed(() => this.flow()?.steps ?? []);
  currentStepIndex = computed(() => this.flowState().currentStepIndex ?? -1);
  isFirstStep = computed(() => this.currentStepIndex() === 0);
  isSubmittingFinalStep = computed(() => (this.currentStepIndex() + 1) >= this.steps().length);
  
  // New computed property to check if the current step executes a final query
  isStepWithFinalQuery = computed(() => !!this.flowState().currentStep?.queryChain?.length);

  constructor() {
    effect(() => {
      const currentFlow = this.flow();
      if (currentFlow) {
        this.flowService.startFlow(currentFlow.id);
      }
    });

    effect(() => {
      this.stepSubscriptions$.next(); // Complete subscriptions from the previous step
      const state = this.flowState();
      if (state.status === 'ready' && state.currentStep) {
        this.buildFormForStep(state);
        this.setupDynamicFields(state);
      } else {
        this.fieldOptions.set({});
        this.fieldLoading.set({});
      }
    });
  }

  buildFormForStep(state: FlowState): void {
    this.dynamicForm = this.fb.group({});
    const step = state.currentStep;
    if (step) {
      step.formFields.forEach(field => {
        const existingValue = state.completedStepsPayload[field.key] || '';
        const control = this.fb.control(existingValue, field.required ? Validators.required : null);
        if (field.type === 'select' && field.dependencyKey) {
            control.disable(); // Dependent fields start as disabled
        }
        this.dynamicForm.addControl(field.key, control);
      });
    }
  }

  private setupDynamicFields(state: FlowState): void {
    const fields = state.currentStep?.formFields ?? [];
    
    // Initial load for independent select fields
    fields.forEach(field => {
      if (field.type === 'select' && field.queryName && !field.dependencyKey) {
        this.loadOptions(field, field); // Pass field as both target and parent
      }
    });

    // Setup listeners for parent fields that have dependents
    fields.forEach(parentField => {
      const control = this.dynamicForm.get(parentField.key);
      if (!control) return;

      const childField = fields.find(f => f.dependencyKey === parentField.key);
      if (childField) {
        control.valueChanges.pipe(
          takeUntil(this.stepSubscriptions$),
          takeUntilDestroyed(this.destroyRef)
        ).subscribe(value => {
          const childControl = this.dynamicForm.get(childField.key);
          childControl?.reset('');
          this.fieldOptions.update(opts => ({ ...opts, [childField.key]: [] }));
          
          if (value) {
            childControl?.enable();
            this.loadOptions(childField, parentField, value);
          } else {
            childControl?.disable();
          }
        });
      }
    });
  }

  private loadOptions(targetField: FormField, parentField: FormField, dependencyValue?: string): void {
    if (!targetField.queryName) return;

    this.fieldLoading.update(loading => ({ ...loading, [targetField.key]: true }));

    this.flowService.fetchOptions(targetField.queryName, parentField, dependencyValue ?? '')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(options => {
        this.fieldOptions.update(opts => ({ ...opts, [targetField.key]: options }));
        this.fieldLoading.update(loading => ({ ...loading, [targetField.key]: false }));
      });
  }

  onSubmit(): void {
    if (this.dynamicForm.invalid) {
      this.dynamicForm.markAllAsTouched();
      return;
    }
    
    const state = this.flowState();
    if (state.status === 'ready' && state.currentStep) {
      const payload = this.dynamicForm.getRawValue(); // Get all values, including disabled
      const flowId = this.flow()?.id;
      if(flowId) {
          this.flowService.advanceFlow({
          flowId: flowId,
          currentStepId: state.currentStep.stepId,
          payload: payload
          });
      }
    }
  }

  onBack(): void {
    const flowId = this.flow()?.id;
    if (flowId) {
      this.flowService.regressFlow(flowId);
    }
  }

  onClose(): void {
    this.closeModal.emit();
  }

  // Helper to format final result object for display
  getFormattedResult(result: any): [string, any][] {
    if (!result || typeof result !== 'object') return [];
    return Object.entries(result);
  }
}
