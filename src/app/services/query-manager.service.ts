
import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CustomQuery } from '../models/query.model';
import { FormFieldOption } from '../models/flow.model';

const MOCK_QUERIES: CustomQuery[] = [
  {
    name: 'GET_FACULTIES',
    description: 'Retrieves a list of all available faculties.',
    targetEndpoint: 'GET_FACULTIES',
    isCatalog: true,
    parameters: [],
    locked: true,
  },
  {
    name: 'GET_CAREERS_BY_FACULTY',
    description: 'Retrieves careers for a given faculty.',
    targetEndpoint: 'GET_CAREERS_BY_FACULTY',
    isCatalog: true,
    parameters: [
      { key: 'facultyId', label: 'Faculty ID', type: 'string', required: true },
    ],
  },
  {
    name: 'GET_LEVELS_BY_CAREER',
    description: 'Retrieves academic levels for a given career.',
    targetEndpoint: 'GET_LEVELS_BY_CAREER',
    isCatalog: true,
    parameters: [
      { key: 'careerId', label: 'Career ID', type: 'string', required: true },
    ],
  },
  {
      name: 'FINAL_STUDENT_ENROLLMENT',
      description: 'Enrolls a student and returns their new ID.',
      targetEndpoint: 'FINAL_STUDENT_ENROLLMENT',
      isCatalog: false,
      parameters: [
          { key: 'faculty', label: 'Faculty', type: 'string', required: true },
          { key: 'career', label: 'Career', type: 'string', required: true },
          { key: 'level', label: 'Level', type: 'string', required: true },
          { key: 'student_name', label: 'Student Name', type: 'string', required: true },
          { key: 'student_email', label: 'Student Email', type: 'string', required: true },
      ]
  },
  {
      name: 'ASSIGN_DEFAULT_COURSE',
      description: 'Assigns a default course to a newly enrolled student.',
      targetEndpoint: 'ASSIGN_DEFAULT_COURSE',
      isCatalog: false,
      parameters: [
          { key: 'studentId', label: 'Student ID', type: 'string', required: true },
      ]
  }
];


@Injectable({
  providedIn: 'root',
})
export class QueryManagerService {
  queries = signal<CustomQuery[]>(MOCK_QUERIES);

  getAvailableQueries(): CustomQuery[] {
    return this.queries();
  }

  createQuery(query: CustomQuery): { success: boolean, error?: string } {
    if (this.queries().some(q => q.name === query.name)) {
      return { success: false, error: 'Query with this name already exists.' };
    }
    this.queries.update(queries => [...queries, query]);
    return { success: true };
  }

  updateQuery(updatedQuery: CustomQuery): { success: boolean, error?: string } {
    let found = false;
    let locked = false;
    this.queries.update(queries => {
      const index = queries.findIndex(q => q.name === updatedQuery.name);
      if (index > -1) {
        if (queries[index].locked) {
          locked = true;
          return queries;
        }
        queries[index] = updatedQuery;
        found = true;
        return [...queries];
      }
      return queries;
    });
    if (locked) {
      return { success: false, error: 'Cannot update a locked query.' };
    }
    if (!found) {
        return { success: false, error: 'Query not found for update.' };
    }
    return { success: true };
  }

  deleteQuery(queryName: string): { success: boolean, error?: string } {
    const query = this.queries().find(q => q.name === queryName);
    if (query?.locked) {
      return { success: false, error: 'Cannot delete a locked query.' };
    }
    this.queries.update(queries => queries.filter(q => q.name !== queryName));
    return { success: true };
  }

  toggleQueryLock(queryName: string): void {
    this.queries.update(queries => {
      const index = queries.findIndex(q => q.name === queryName);
      if (index > -1) {
        queries[index].locked = !queries[index].locked;
        return [...queries];
      }
      return queries;
    });
  }

  executeQuery(queryName: string, params: { [key: string]: any }): Observable<any> {
    const query = this.queries().find(q => q.name === queryName);
    if (!query) {
      return throwError(() => new Error(`Query "${queryName}" not found.`));
    }

    // --- Parameter Validation ---
    for (const p of query.parameters) {
      const value = params[p.key];
      const valueIsPresent = value !== null && value !== undefined && value !== '';

      // 1. Check for missing required parameters
      if (p.required && !valueIsPresent) {
        return throwError(() => new Error(`Missing required parameter: "${p.key}" for query "${queryName}".`));
      }

      // 2. If a value is present, check its type
      if (valueIsPresent) {
        switch (p.type) {
          case 'number':
            if (typeof value !== 'number' && isNaN(Number(value))) {
              return throwError(() => new Error(`Type mismatch for parameter "${p.key}". Expected a number, but received "${value}".`));
            }
            break;

          case 'date':
            const date = new Date(value);
            if (isNaN(date.getTime())) {
              return throwError(() => new Error(`Type mismatch for parameter "${p.key}". Expected a valid date format, but received "${value}".`));
            }
            break;
            
          case 'string':
            // All values can be treated as strings, no specific check needed beyond presence.
            break;
        }
      }
    }
    // --- End Validation ---

    console.log(`Executing query: ${queryName}`, { params });

    switch (query.targetEndpoint) {
      case 'GET_FACULTIES':
        return of<FormFieldOption[]>([
          { value: 'sci', label: 'Science' },
          { value: 'art', label: 'Arts' },
          { value: 'eng', label: 'Engineering' },
        ]).pipe(delay(500));
      
      case 'GET_CAREERS_BY_FACULTY':
        const facultyId = params['facultyId'];
        let careers: FormFieldOption[] = [];
        if (facultyId === 'sci') {
          careers = [
            { value: 'bio', label: 'Biology' },
            { value: 'chem', label: 'Chemistry' },
          ];
        } else if (facultyId === 'eng') {
          careers = [
            { value: 'mech', label: 'Mechanical Engineering' },
            { value: 'elec', label: 'Electrical Engineering' },
          ];
        } else if (facultyId === 'art') {
            careers = [
              { value: 'hist', label: 'History' },
              { value: 'lit', label: 'Literature' },
            ];
        }
        return of(careers).pipe(delay(500));
        
      case 'GET_LEVELS_BY_CAREER':
        const careerId = params['careerId'];
        let levels: FormFieldOption[] = [];
        if (['bio', 'chem', 'mech', 'elec', 'hist', 'lit'].includes(careerId)) {
            levels = [
                { value: '100', label: '100 Level' },
                { value: '200', label: '200 Level' },
                { value: '300', label: '300 Level' },
                { value: '400', label: '400 Level' },
            ];
        }
        return of(levels).pipe(delay(500));
      
      case 'FINAL_STUDENT_ENROLLMENT':
        console.log('Finalizing student enrollment with payload:', params);
        // Simulate a final submission, returning a confirmation object.
        return of({
            success: true,
            message: `Student ${params['student_name']} enrolled successfully!`,
            enrollmentId: `ENRL-${Date.now()}`,
            studentId: `STU-${Math.floor(Math.random() * 10000)}`
        }).pipe(delay(1000));
      
      case 'ASSIGN_DEFAULT_COURSE':
        const studentId = params['studentId'];
        if (!studentId) {
            return throwError(() => new Error(`studentId is required for ASSIGN_DEFAULT_COURSE.`));
        }
        console.log(`Assigning default course to student ${studentId}`);
        return of({
            success: true,
            message: `Default course 'INTRO-101' assigned to student ${studentId}.`,
            courseAssignmentId: `CAS-${Date.now()}`
        }).pipe(delay(800));
        
      default:
        // For custom endpoints, we'd make an HTTP call here.
        // For this mock, we'll return an error if not implemented.
        return throwError(() => new Error(`Mock endpoint for "${query.targetEndpoint}" not implemented.`));
    }
  }
}
