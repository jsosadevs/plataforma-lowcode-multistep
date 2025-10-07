
/**
 * Defines a parameter that the user must provide for a query.
 * This is what the Flow Runner will pass to the query.
 */
export interface QueryParameter {
  key: string; // e.g., 'facultyId'
  label: string;
  type: 'string' | 'number' | 'date';
  required: boolean;
}

/**
 * Defines the structure of a configurable Custom Query.
 */
export interface CustomQuery {
  name: string; // Unique name, e.g., 'GET_CAREERS_BY_FACULTY'
  description: string;
  // Simulated internal endpoint or the actual API path
  targetEndpoint: string; 
  isCatalog: boolean; // true for populating selects, false for final results
  parameters: QueryParameter[];
  locked?: boolean;
}
