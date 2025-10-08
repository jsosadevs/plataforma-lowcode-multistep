import React, { useState, useEffect } from 'react';
import { FormField } from '../types/flow';
import { useQueryManager } from '../hooks/useQueryManager';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

interface DynamicFormProps {
  fields: FormField[];
  values: { [key: string]: any };
  onChange: (fieldKey: string, value: any) => void;
  onSubmit?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
  showSubmit?: boolean;
}

interface SelectOption {
  id: any;
  name: string;
  [key: string]: any;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  values,
  onChange,
  onSubmit,
  submitLabel = 'Continue',
  isLoading = false,
  showSubmit = true
}) => {
  const { executeQuery } = useQueryManager();
  const [selectOptions, setSelectOptions] = useState<{ [fieldKey: string]: SelectOption[] }>({});
  const [loadingSelects, setLoadingSelects] = useState<Set<string>>(new Set());

  // Load options for select fields
  useEffect(() => {
    const loadSelectOptions = async () => {
      for (const field of fields) {
        if (field.type === 'select' && field.queryName) {
          setLoadingSelects(prev => new Set(prev).add(field.key));
          
          try {
            let queryParams = {};
            
            // Handle cascading selects - wait for dependency value
            if (field.dependencyKey) {
              const dependencyValue = values[field.dependencyKey];
              if (!dependencyValue) {
                setSelectOptions(prev => ({ ...prev, [field.key]: [] }));
                setLoadingSelects(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(field.key);
                  return newSet;
                });
                continue;
              }
              queryParams = { [field.dependencyKey]: dependencyValue };
            }
            
            const result = await executeQuery(field.queryName, queryParams);
            setSelectOptions(prev => ({
              ...prev,
              [field.key]: Array.isArray(result) ? result : []
            }));
          } catch (error) {
            console.error(`Error loading options for ${field.key}:`, error);
            setSelectOptions(prev => ({ ...prev, [field.key]: [] }));
          } finally {
            setLoadingSelects(prev => {
              const newSet = new Set(prev);
              newSet.delete(field.key);
              return newSet;
            });
          }
        }
      }
    };

    loadSelectOptions();
  }, [fields, values, executeQuery]);

  // Reset dependent selects when dependency changes
  useEffect(() => {
    fields.forEach(field => {
      if (field.dependencyKey && field.dependencyKey in values) {
        // Clear the dependent field value when dependency changes
        if (values[field.key] && field.type === 'select') {
          onChange(field.key, '');
        }
      }
    });
  }, [fields, values, onChange]);

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && (value === undefined || value === null || value === '')) {
      return `${field.label} is required`;
    }

    if (value && field.validation) {
      const { pattern, min, max, minLength, maxLength } = field.validation;
      
      if (pattern && typeof value === 'string') {
        const regex = new RegExp(pattern);
        if (!regex.test(value)) {
          return `${field.label} format is invalid`;
        }
      }
      
      if (typeof value === 'number') {
        if (min !== undefined && value < min) {
          return `${field.label} must be at least ${min}`;
        }
        if (max !== undefined && value > max) {
          return `${field.label} must be at most ${max}`;
        }
      }
      
      if (typeof value === 'string') {
        if (minLength !== undefined && value.length < minLength) {
          return `${field.label} must be at least ${minLength} characters`;
        }
        if (maxLength !== undefined && value.length > maxLength) {
          return `${field.label} must be at most ${maxLength} characters`;
        }
      }
    }

    return null;
  };

  const isFormValid = (): boolean => {
    return fields.every(field => {
      const value = values[field.key];
      return validateField(field, value) === null;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid() && onSubmit) {
      onSubmit();
    }
  };

  const renderField = (field: FormField) => {
    const value = values[field.key] || '';
    const error = validateField(field, value);
    const isSelectLoading = loadingSelects.has(field.key);

    const fieldId = `field-${field.key}`;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={fieldId}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={fieldId}
              type={field.type}
              value={value}
              onChange={(e) => onChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className={error ? 'border-destructive' : ''}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={fieldId}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Textarea
              id={fieldId}
              value={value}
              onChange={(e) => onChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className={error ? 'border-destructive' : ''}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case 'select':
        const options = selectOptions[field.key] || [];
        const isDisabled = isSelectLoading || (field.dependencyKey && !values[field.dependencyKey]);
        
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={fieldId}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(newValue) => onChange(field.key, newValue)}
              disabled={isDisabled}
            >
              <SelectTrigger className={error ? 'border-destructive' : ''}>
                <SelectValue 
                  placeholder={
                    isSelectLoading 
                      ? 'Loading...' 
                      : isDisabled && field.dependencyKey 
                      ? `Select ${fields.find(f => f.key === field.dependencyKey)?.label} first`
                      : `Select ${field.label}`
                  } 
                />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.id} value={option.id.toString()}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isSelectLoading && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Loading options...
              </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.key} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={fieldId}
                checked={value || false}
                onCheckedChange={(checked) => onChange(field.key, checked)}
              />
              <Label htmlFor={fieldId} className="cursor-pointer">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map(renderField)}
      
      {showSubmit && (
        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            disabled={!isFormValid() || isLoading}
            className="min-w-32"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      )}
    </form>
  );
};