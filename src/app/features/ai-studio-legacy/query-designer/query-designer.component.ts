
import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { QueryManagerService } from '../../services/query-manager.service';
import { CustomQuery, QueryParameter } from '../../models/query.model';

@Component({
  selector: 'app-query-designer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './query-designer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueryDesignerComponent {
  private queryManager = inject(QueryManagerService);
  // FIX: Explicitly type the injected FormBuilder to prevent it from being inferred as `unknown`.
  private fb: FormBuilder = inject(FormBuilder);

  queries = this.queryManager.queries;

  // State
  selectedQueryName = signal<string | null>(null);
  showQueryForm = signal(false);
  isEditing = signal(false);
  actionsMenuOpenForQuery = signal<string | null>(null);

  // New state for delete confirmation
  showDeleteConfirm = signal(false);
  queryToDelete = signal<CustomQuery | null>(null);

  // Computed
  selectedQuery = computed<CustomQuery | null>(() => {
    const name = this.selectedQueryName();
    if (!name) return null;
    return this.queries().find(q => q.name === name) ?? null;
  });

  // Forms
  queryForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^[A-Z0-9_]+$/)]],
    description: ['', Validators.required],
    targetEndpoint: ['', [Validators.required, Validators.pattern(/^[A-Z_]+$|^\/[a-zA-Z0-9_\-\/]+$/)]],
    isCatalog: [false],
    parameters: this.fb.array([]),
  });
  
  parameterTypes: QueryParameter['type'][] = ['string', 'number', 'date'];

  get parameters(): FormArray {
    return this.queryForm.get('parameters') as FormArray;
  }

  // --- UI Actions ---
  selectQuery(query: CustomQuery): void {
    this.selectedQueryName.set(query.name);
    this.showQueryForm.set(false);
    this.actionsMenuOpenForQuery.set(null);
  }

  cancelForm(): void {
    this.showQueryForm.set(false);
    this.isEditing.set(false);
    this.actionsMenuOpenForQuery.set(null);
  }

  toggleActionsMenu(queryName: string): void {
    if (this.actionsMenuOpenForQuery() === queryName) {
      this.actionsMenuOpenForQuery.set(null);
    } else {
      this.actionsMenuOpenForQuery.set(queryName);
    }
  }

  // --- CRUD Actions ---
  addNewQuery(): void {
    this.isEditing.set(false);
    this.queryForm.reset({
      isCatalog: false,
    });
    this.parameters.clear();
    this.queryForm.get('name')?.enable();
    this.showQueryForm.set(true);
    this.selectedQueryName.set(null);
  }

  editQuery(query: CustomQuery): void {
    if (query.locked) return;
    this.isEditing.set(true);
    this.selectedQueryName.set(query.name);
    
    this.queryForm.reset();
    this.parameters.clear();

    this.queryForm.patchValue(query);

    query.parameters.forEach(p => this.parameters.push(this.createParameterGroup(p)));
    
    this.queryForm.get('name')?.disable();
    this.showQueryForm.set(true);
  }

  requestDeleteQuery(query: CustomQuery): void {
    if (query.locked) return;
    this.queryToDelete.set(query);
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.queryToDelete.set(null);
    this.showDeleteConfirm.set(false);
  }

  confirmDelete(): void {
    const query = this.queryToDelete();
    if (query) {
      const result = this.queryManager.deleteQuery(query.name);
      if (!result.success) {
        alert(result.error);
      } else if (this.selectedQueryName() === query.name) {
        this.selectedQueryName.set(null);
        this.cancelForm();
      }
    }
    this.cancelDelete();
  }

  saveQuery(): void {
    if (this.queryForm.invalid) {
      this.queryForm.markAllAsTouched();
      return;
    }

    const queryData = this.queryForm.getRawValue();
    
    if (this.isEditing()) {
      const result = this.queryManager.updateQuery(queryData);
      if (!result.success) {
        alert(result.error);
      }
    } else {
      const result = this.queryManager.createQuery(queryData);
      if (!result.success) {
        alert(result.error);
        return;
      }
    }

    this.selectQuery(queryData);
    this.showQueryForm.set(false);
    this.isEditing.set(false);
  }

  toggleLock(queryName: string): void {
    this.queryManager.toggleQueryLock(queryName);
    if (this.selectedQuery()?.locked && this.showQueryForm()) {
      this.cancelForm();
      this.selectedQueryName.set(queryName);
    }
  }

  // --- Parameter FormArray Management ---
  createParameterGroup(param: QueryParameter | null = null): FormGroup {
    return this.fb.group({
      key: [param?.key || '', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      label: [param?.label || '', Validators.required],
      type: [param?.type || 'string', Validators.required],
      required: [param?.required || false],
    });
  }

  addParameter(): void {
    this.parameters.push(this.createParameterGroup());
  }

  removeParameter(index: number): void {
    this.parameters.removeAt(index);
  }
}
