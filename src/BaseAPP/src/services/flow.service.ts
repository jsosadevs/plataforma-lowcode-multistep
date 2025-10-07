import { Injectable, signal, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, from, throwError } from 'rxjs';
import { map, catchError, switchMap, concatMap, reduce, tap } from 'rxjs/operators';
import { AdvanceFlowPayload, Flow, FlowGroup, FlowState, FormField, FlowStep, FormFieldOption, QueryChainAction } from '../models/flow.model';
import { QueryManagerService } from './query-manager.service';

const MOCK_FLOWS: Flow[] = [
  {
    id: 'user-onboarding',
    name: 'User Onboarding',
    description: 'A simple flow to onboard a new user.',
    steps: [
      {
        stepId: 'personal-info',
        title: 'Personal Information',
        description: 'Please enter your personal details.',
        formFields: [
          { key: 'name', label: 'Full Name', type: 'text', required: true },
          { key: 'email', label: 'Email Address', type: 'email', required: true },
        ],
      },
      {
        stepId: 'password-setup',
        title: 'Password Setup',
        description: 'Choose a secure password.',
        formFields: [
          { key: 'password', label: 'Password', type: 'password', required: true },
        ],
      },
      {
        stepId: 'confirmation',
        title: 'Confirmation',
        description: 'You are all set! Your account has been created.',
        formFields: [],
      },
    ],
    availableInCertificates: true,
  },
  {
    id: 'leave-request',
    name: 'Leave Request',
    description: 'Submit a request for time off.',
    locked: true,
    steps: [
        {
            stepId: 'request-details',
            title: 'Request Details',
            description: 'Provide details for your leave request.',
            formFields: [
                { key: 'startDateTime', label: 'Start Date & Time', type: 'datetime-local', required: true },
                { key: 'endDateTime', label: 'End Date & Time', type: 'datetime-local', required: true },
            ]
        },
        {
            stepId: 'reason',
            title: 'Reason for Leave',
            description: 'Briefly explain the reason for your absence.',
            formFields: [
                { key: 'reason', label: 'Reason', type: 'textarea', required: false },
            ]
        },
        {
            stepId: 'summary',
            title: 'Summary',
            description: 'Please review your leave request before submitting.',
            formFields: []
        }
    ],
    availableInCertificates: false,
  },
  {
    id: 'student-enrollment',
    name: 'Student Enrollment & Course Assignment',
    description: 'Enroll a student and automatically assign them a default course.',
    steps: [
      {
        stepId: 'program-selection',
        title: 'Program Selection',
        description: 'Choose the faculty, career, and level for the student.',
        formFields: [
          { key: 'faculty', label: 'Faculty', type: 'select', required: true, queryName: 'GET_FACULTIES' },
          { key: 'career', label: 'Career', type: 'select', required: true, queryName: 'GET_CAREERS_BY_FACULTY', dependencyKey: 'faculty' },
          { key: 'level', label: 'Level', type: 'select', required: true, queryName: 'GET_LEVELS_BY_CAREER', dependencyKey: 'career' },
        ],
      },
      {
        stepId: 'student-details',
        title: 'Student Details & Enrollment',
        description: 'Enter student info to enroll them and assign a default course.',
        formFields: [
          { key: 'student_name', label: 'Full Name', type: 'text', required: true },
          { key: 'student_email', label: 'Email Address', type: 'email', required: true },
        ],
        queryChain: [
          {
            queryName: 'FINAL_STUDENT_ENROLLMENT',
            resultKey: 'enrollmentResult',
            parameters: { 
              faculty: 'payload.faculty',
              career: 'payload.career',
              level: 'payload.level',
              student_name: 'payload.student_name',
              student_email: 'payload.student_email'
            }
          },
          {
            queryName: 'ASSIGN_DEFAULT_COURSE',
            resultKey: 'courseAssignmentResult',
            parameters: {
              studentId: 'results.enrollmentResult.studentId'
            }
          }
        ]
      },
      {
        stepId: 'enrollment-summary',
        title: 'Summary',
        description: 'This step is for confirmation after enrollment.',
        formFields: []
      }
    ],
    availableInCertificates: true,
  }
];

const MOCK_FLOW_GROUPS: FlowGroup[] = [
    {
        category: 'Human Resources',
        flows: [MOCK_FLOWS[0], MOCK_FLOWS[1]]
    },
    {
        category: 'Academics',
        flows: [MOCK_FLOWS[2]]
    },
    {
        category: 'IT Support',
        flows: []
    }
];

@Injectable({
  providedIn: 'root',
})
export class FlowService {
  private queryManager = inject(QueryManagerService);
  flowGroups = signal<FlowGroup[]>(MOCK_FLOW_GROUPS);

  private readonly flowStateSubject = new BehaviorSubject<FlowState>({
    status: 'loading',
    completedStepsPayload: {},
  });
  public readonly flowState$ = this.flowStateSubject.asObservable();

  startFlow(flowId: string): void {
    const flow = this.flowGroups().flatMap(g => g.flows).find(f => f.id === flowId);
    if (flow && flow.steps.length > 0) {
      this.flowStateSubject.next({
        status: 'ready',
        currentStep: flow.steps[0],
        currentStepIndex: 0,
        completedStepsPayload: {},
        flowId: flowId,
      });
    } else {
      this.flowStateSubject.next({
        status: 'error',
        error: 'Flow not found or has no steps.',
        completedStepsPayload: {},
      });
    }
  }

  advanceFlow(payload: AdvanceFlowPayload): void {
    const flow = this.flowGroups().flatMap(g => g.flows).find(f => f.id === payload.flowId);
    if (!flow) {
      this.flowStateSubject.next({ ...this.flowStateSubject.value, status: 'error', error: 'Flow not found.' });
      return;
    }

    const currentStepIndex = flow.steps.findIndex(s => s.stepId === payload.currentStepId);
    if (currentStepIndex === -1) {
        this.flowStateSubject.next({ ...this.flowStateSubject.value, status: 'error', error: 'Current step not found.' });
        return;
    }

    const currentStep = flow.steps[currentStepIndex];
    const newPayload = { ...this.flowStateSubject.value.completedStepsPayload, ...payload.payload };

    if (currentStep.queryChain && currentStep.queryChain.length > 0) {
      this.flowStateSubject.next({ ...this.flowStateSubject.value, status: 'loading' });
      
      this.executeQueryChain(currentStep.queryChain, newPayload).subscribe({
        next: (finalResults) => {
          this.flowStateSubject.next({
            status: 'final-result',
            completedStepsPayload: newPayload,
            flowId: payload.flowId,
            finalQueryResult: finalResults
          });
        },
        error: (err) => {
          this.flowStateSubject.next({
            status: 'error',
            error: err.message || 'An error occurred during query chain execution.',
            completedStepsPayload: newPayload,
            flowId: payload.flowId,
          });
        }
      });
      return; 
    }

    const nextStepIndex = currentStepIndex + 1;

    if (nextStepIndex < flow.steps.length) {
        this.flowStateSubject.next({
            status: 'ready',
            currentStep: flow.steps[nextStepIndex],
            currentStepIndex: nextStepIndex,
            completedStepsPayload: newPayload,
            flowId: payload.flowId,
        });
    } else {
        this.flowStateSubject.next({
            status: 'completed',
            completedStepsPayload: newPayload,
            flowId: payload.flowId,
        });
    }
  }

  private executeQueryChain(chain: QueryChainAction[], payload: { [key: string]: any }): Observable<any> {
    const initialContext = { payload, results: {} };

    return from(chain).pipe(
      concatMap(action => {
        const resolvedParams = this._resolveParameters(action.parameters, payload, (initialContext as any).results);
        
        return this.queryManager.executeQuery(action.queryName, resolvedParams).pipe(
          tap(result => {
            (initialContext.results as any)[action.resultKey] = result;
          }),
          map(() => initialContext) 
        );
      }),
      reduce((_, context) => context.results), 
      catchError(err => {
        console.error('Query Chain Failed:', err);
        return throwError(() => new Error(`Query "${err.queryName}" failed: ${err.message}`));
      })
    );
  }

  private _resolveParameters(paramMappings: { [key: string]: string }, payload: any, resultsContext: any): { [key: string]: any } {
    const resolved: { [key: string]: any } = {};
    for (const key in paramMappings) {
      const mapping = paramMappings[key];
      const parts = mapping.split('.');
      
      if (parts.length < 2) {
        throw new Error(`Invalid parameter mapping: "${mapping}". Must be in the format "source.value"`);
      }

      const source = parts.shift();
      const path = parts.join('.');

      let value: any;
      if (source === 'payload') {
        value = this._getObjectValueByPath(payload, path);
      } else if (source === 'results') {
        value = this._getObjectValueByPath(resultsContext, path);
      } else {
        throw new Error(`Invalid parameter source: "${source}". Must be "payload" or "results".`);
      }
      
      if (value === undefined) {
          console.warn(`Could not resolve value for mapping "${mapping}". Resulting parameter will be undefined.`);
      }

      resolved[key] = value;
    }
    return resolved;
  }

  private _getObjectValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((o, p) => (o && o[p] !== undefined) ? o[p] : undefined, obj);
  }

  regressFlow(flowId: string): void {
    const flow = this.flowGroups().flatMap(g => g.flows).find(f => f.id === flowId);
    const currentState = this.flowStateSubject.value;
    const currentStepIndex = currentState.currentStepIndex;

    if (!flow || currentStepIndex === undefined || currentStepIndex <= 0) {
        return;
    }

    const previousStepIndex = currentStepIndex - 1;
    this.flowStateSubject.next({
        ...currentState,
        status: 'ready',
        currentStep: flow.steps[previousStepIndex],
        currentStepIndex: previousStepIndex,
    });
  }

  fetchOptions(queryName: string, parentField: FormField, parentValue: string): Observable<FormFieldOption[]> {
    const query = this.queryManager.getAvailableQueries().find(q => q.name === queryName);
    if (!query) return of([]);

    const params: { [key: string]: any } = {};
    const dependencyParam = query.parameters.find(p => p.key.toLowerCase().includes(parentField.key.toLowerCase()));
    
    if (dependencyParam) {
        params[dependencyParam.key] = parentValue;
    }

    return this.queryManager.executeQuery(queryName, params).pipe(
      map(result => result as FormFieldOption[]),
      catchError(error => {
        console.error(`Error executing catalog query ${queryName}:`, error);
        this.flowStateSubject.next({
          ...this.flowStateSubject.value,
          status: 'error',
          error: `Failed to load options for ${parentField.label}.`
        });
        return of([]);
      })
    );
  }

  createFlowGroup(category: string): boolean {
    let success = false;
    this.flowGroups.update(groups => {
      if (groups.some(g => g.category.toLowerCase() === category.toLowerCase())) {
        success = false;
        return groups;
      }
      success = true;
      return [...groups, { category, flows: [] }];
    });
    return success;
  }

  createFlow(flow: Flow, category: string) {
    this.flowGroups.update(groups => {
      const newGroups = JSON.parse(JSON.stringify(groups));
      const group = newGroups.find((g: FlowGroup) => g.category === category);
      if (group && !group.flows.some((f: Flow) => f.id === flow.id)) {
        group.flows.push({ ...flow, steps: [] }); // Ensure new flows have empty steps
      }
      return newGroups;
    });
  }

  updateFlow(updatedFlow: Flow) {
     this.flowGroups.update(groups => {
      const newGroups = JSON.parse(JSON.stringify(groups));
      for (const group of newGroups) {
        const flowIndex = group.flows.findIndex((f: Flow) => f.id === updatedFlow.id);
        if (flowIndex > -1) {
          // Preserve steps from original object, only update top-level properties
          const originalSteps = group.flows[flowIndex].steps;
          group.flows[flowIndex] = { ...updatedFlow, steps: originalSteps };
          break;
        }
      }
      return newGroups;
    });
  }

  deleteFlow(flowId: string, category: string): void {
    this.flowGroups.update(groups => {
      const newGroups = JSON.parse(JSON.stringify(groups));
      const group = newGroups.find((g: FlowGroup) => g.category === category);
      if (group) {
        group.flows = group.flows.filter((f: Flow) => f.id !== flowId);
      }
      return newGroups;
    });
  }

  toggleFlowLock(flowId: string): void {
    this.flowGroups.update(groups => {
      const newGroups = JSON.parse(JSON.stringify(groups));
      const flow = newGroups.flatMap((g: FlowGroup) => g.flows).find((f: Flow) => f.id === flowId);
      if (flow) {
        flow.locked = !flow.locked;
      }
      return newGroups;
    });
  }

  createStep(flowId: string, step: FlowStep) {
    this.flowGroups.update(groups => {
        const newGroups = JSON.parse(JSON.stringify(groups));
        const flow = newGroups.flatMap((g: FlowGroup) => g.flows).find((f: Flow) => f.id === flowId);
        if (flow && !flow.steps.some((s: FlowStep) => s.stepId === step.stepId)) {
            flow.steps.push(step);
        }
        return newGroups;
    });
  }

  updateStep(flowId: string, updatedStep: FlowStep) {
    this.flowGroups.update(groups => {
        const newGroups = JSON.parse(JSON.stringify(groups));
        const flow = newGroups.flatMap((g: FlowGroup) => g.flows).find((f: Flow) => f.id === flowId);
        if (flow) {
            const stepIndex = flow.steps.findIndex((s: FlowStep) => s.stepId === updatedStep.stepId);
            if (stepIndex > -1) {
                flow.steps[stepIndex] = updatedStep;
            }
        }
        return newGroups;
    });
  }

  addFormField(flowId: string, stepId: string, field: FormField) {
    this.flowGroups.update(groups => {
      const newGroups = JSON.parse(JSON.stringify(groups));
      const flow = newGroups.flatMap((g: FlowGroup) => g.flows).find((f: Flow) => f.id === flowId);
      if (flow) {
        const step = flow.steps.find((s: FlowStep) => s.stepId === stepId);
        if (step && !step.formFields.some((f: FormField) => f.key === field.key)) {
          step.formFields.push(field);
        }
      }
      return newGroups;
    });
  }

  updateFormField(flowId: string, stepId: string, updatedField: FormField) {
    this.flowGroups.update(groups => {
      const newGroups = JSON.parse(JSON.stringify(groups));
       const flow = newGroups.flatMap((g: FlowGroup) => g.flows).find((f: Flow) => f.id === flowId);
       if (flow) {
        const step = flow.steps.find((s: FlowStep) => s.stepId === stepId);
        if (step) {
          const fieldIndex = step.formFields.findIndex((f: FormField) => f.key === updatedField.key);
          if (fieldIndex > -1) {
            step.formFields[fieldIndex] = updatedField;
          }
        }
      }
      return newGroups;
    });
  }

  deleteFormField(flowId: string, stepId: string, fieldKey: string) {
    this.flowGroups.update(groups => {
      const newGroups = JSON.parse(JSON.stringify(groups));
       const flow = newGroups.flatMap((g: FlowGroup) => g.flows).find((f: Flow) => f.id === flowId);
       if (flow) {
        const step = flow.steps.find((s: FlowStep) => s.stepId === stepId);
        if (step) {
          step.formFields = step.formFields.filter((f: FormField) => f.key !== fieldKey);
        }
      }
      return newGroups;
    });
  }

  reorderSteps(flowId: string, fromIndex: number, toIndex: number): void {
    this.flowGroups.update(groups => {
      const newGroups = JSON.parse(JSON.stringify(groups));
      const flow = newGroups.flatMap((g: FlowGroup) => g.flows).find((f: Flow) => f.id === flowId);
      if (flow && fromIndex !== toIndex) {
        const [movedStep] = flow.steps.splice(fromIndex, 1);
        flow.steps.splice(toIndex, 0, movedStep);
      }
      return newGroups;
    });
  }

  reorderFields(flowId: string, stepId: string, fromIndex: number, toIndex: number): void {
    this.flowGroups.update(groups => {
      const newGroups = JSON.parse(JSON.stringify(groups));
      const flow = newGroups.flatMap((g: FlowGroup) => g.flows).find((f: Flow) => f.id === flowId);
      if (flow) {
        const step = flow.steps.find((s: FlowStep) => s.stepId === stepId);
        if (step && fromIndex !== toIndex) {
          const [movedField] = step.formFields.splice(fromIndex, 1);
          step.formFields.splice(toIndex, 0, movedField);
        }
      }
      return newGroups;
    });
  }
}