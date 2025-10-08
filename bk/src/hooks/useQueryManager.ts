import { useState, useCallback } from 'react';
import { CustomQuery, QueryParameter, FormFieldOption } from '../types/flow';

// Mock queries matching Angular implementation
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

export const useQueryManager = () => {
  const [queries, setQueries] = useState<CustomQuery[]>(MOCK_QUERIES);

  const getAvailableQueries = useCallback((): CustomQuery[] => {
    return queries;
  }, [queries]);

  const getQuery = useCallback((queryName: string): CustomQuery | undefined => {
    return queries.find(q => q.name === queryName);
  }, [queries]);

  const createQuery = useCallback((query: CustomQuery): { success: boolean; error?: string } => {
    if (queries.some(q => q.name === query.name)) {
      return { success: false, error: 'Query with this name already exists.' };
    }
    setQueries([...queries, query]);
    return { success: true };
  }, [queries]);

  const updateQuery = useCallback((updatedQuery: CustomQuery): { success: boolean; error?: string } => {
    const index = queries.findIndex(q => q.name === updatedQuery.name);
    if (index === -1) {
      return { success: false, error: 'Query not found for update.' };
    }
    if (queries[index].locked) {
      return { success: false, error: 'Cannot update a locked query.' };
    }
    const newQueries = [...queries];
    newQueries[index] = updatedQuery;
    setQueries(newQueries);
    return { success: true };
  }, [queries]);

  const deleteQuery = useCallback((queryName: string): { success: boolean; error?: string } => {
    const query = queries.find(q => q.name === queryName);
    if (query?.locked) {
      return { success: false, error: 'Cannot delete a locked query.' };
    }
    setQueries(queries.filter(q => q.name !== queryName));
    return { success: true };
  }, [queries]);

  const toggleQueryLock = useCallback((queryName: string): void => {
    setQueries(queries.map(q => 
      q.name === queryName ? { ...q, locked: !q.locked } : q
    ));
  }, [queries]);

  const executeQuery = useCallback(async (queryName: string, params: { [key: string]: any } = {}): Promise<any> => {
    const query = queries.find(q => q.name === queryName);
    if (!query) {
      throw new Error(`Query "${queryName}" not found.`);
    }

    // Parameter Validation
    for (const p of query.parameters) {
      const value = params[p.key];
      const valueIsPresent = value !== null && value !== undefined && value !== '';

      // Check for missing required parameters
      if (p.required && !valueIsPresent) {
        throw new Error(`Missing required parameter: "${p.key}" for query "${queryName}".`);
      }

      // If a value is present, check its type
      if (valueIsPresent) {
        switch (p.type) {
          case 'number':
            if (typeof value !== 'number' && isNaN(Number(value))) {
              throw new Error(`Type mismatch for parameter "${p.key}". Expected a number, but received "${value}".`);
            }
            break;

          case 'date':
            const date = new Date(value);
            if (isNaN(date.getTime())) {
              throw new Error(`Type mismatch for parameter "${p.key}". Expected a valid date format, but received "${value}".`);
            }
            break;
            
          case 'string':
            // All values can be treated as strings, no specific check needed beyond presence.
            break;
        }
      }
    }

    console.log(`Executing query: ${queryName}`, { params });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock implementations matching Angular service
    switch (query.targetEndpoint) {
      case 'GET_FACULTIES':
        return [
          { value: 'sci', label: 'Science' },
          { value: 'art', label: 'Arts' },
          { value: 'eng', label: 'Engineering' },
        ] as FormFieldOption[];
      
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
        return careers;
        
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
        return levels;
      
      case 'FINAL_STUDENT_ENROLLMENT':
        console.log('Finalizing student enrollment with payload:', params);
        return {
          success: true,
          message: `Student ${params['student_name']} enrolled successfully!`,
          enrollmentId: `ENRL-${Date.now()}`,
          studentId: `STU-${Math.floor(Math.random() * 10000)}`
        };
      
      case 'ASSIGN_DEFAULT_COURSE':
        const studentId = params['studentId'];
        if (!studentId) {
          throw new Error(`studentId is required for ASSIGN_DEFAULT_COURSE.`);
        }
        console.log(`Assigning default course to student ${studentId}`);
        return {
          success: true,
          message: `Default course 'INTRO-101' assigned to student ${studentId}.`,
          courseAssignmentId: `CAS-${Date.now()}`
        };
        
      default:
        throw new Error(`Mock endpoint for "${query.targetEndpoint}" not implemented.`);
    }
  }, [queries]);

  return {
    queries,
    getAvailableQueries,
    getQuery,
    createQuery,
    updateQuery,
    deleteQuery,
    toggleQueryLock,
    executeQuery,
  };
};
