import React from 'react';
import { FormField } from '../types/flow';
import { useResponsiveLayoutConfig } from '../hooks/useResponsiveLayout';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Loader2, Info, ArrowUpDown } from 'lucide-react';
import { cn } from './ui/utils';

interface ResponsiveFieldRendererProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  onFieldReorder?: (direction: 'up' | 'down') => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  options?: Array<{ label: string; value: any }>;
  viewMode?: 'default' | 'cards' | 'grid' | 'compact' | 'minimal';
  enableCustomization?: boolean;
  index?: number;
}

export const ResponsiveFieldRenderer: React.FC<ResponsiveFieldRendererProps> = ({
  field,
  value,
  onChange,
  onFieldReorder,
  isLoading = false,
  isDisabled = false,
  options = [],
  viewMode = 'default',
  enableCustomization = false,
  index = 0
}) => {
  const { responsive } = useResponsiveLayoutConfig();

  const LabelWithHelp = () => (
    <div className="flex items-center gap-2">
      <Label htmlFor={field.key} className={`${
        responsive.isMobile ? 'text-sm' : ''
      }`}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {field.helpText && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="inline-flex items-center justify-center">
              <Info className={`text-muted-foreground hover:text-foreground transition-colors ${
                responsive.isMobile ? 'w-3 h-3' : 'w-4 h-4'
              }`} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <p className={responsive.isMobile ? 'text-xs' : 'text-sm'}>{field.helpText}</p>
          </TooltipContent>
        </Tooltip>
      )}
      {enableCustomization && onFieldReorder && (
        <div className="flex items-center gap-1 ml-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="opacity-50 hover:opacity-100 h-6 w-6 p-0"
            onClick={() => onFieldReorder('up')}
          >
            <ArrowUpDown className="w-2 h-2" />
          </Button>
        </div>
      )}
    </div>
  );

  const getFieldWrapperClasses = () => {
    const baseClasses = "space-y-2";
    
    if (viewMode === 'cards') {
      return `${baseClasses} transition-shadow`;
    }
    
    if (viewMode === 'minimal') {
      return `${baseClasses} border-l-2 border-primary/20 pl-3 hover:border-primary/40 transition-colors`;
    }

    if (viewMode === 'compact') {
      return "space-y-1";
    }

    if (viewMode === 'wizard') {
      return `${baseClasses} p-4 border rounded-lg bg-gradient-to-r from-primary/5 to-primary/10`;
    }

    return baseClasses;
  };

  const FieldWrapper = ({ children }: { children: React.ReactNode }) => {
    if (viewMode === 'cards') {
      return (
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className={responsive.isMobile ? 'pt-3 px-3 pb-3' : 'pt-4'}>
            {children}
          </CardContent>
        </Card>
      );
    }
    
    return <div className={getFieldWrapperClasses()}>{children}</div>;
  };

  const renderFieldInput = () => {
    const inputSize = responsive.isMobile ? 'h-9' : 'h-10';
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
      case 'date':
      case 'time':
      case 'datetime-local':
        return (
          <Input
            id={field.key}
            type={field.type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={cn("w-full", inputSize)}
            disabled={isDisabled}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={field.key}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={responsive.isMobile ? 3 : viewMode === 'compact' ? 2 : 4}
            className="w-full resize-none"
            disabled={isDisabled}
          />
        );

      case 'select':
        return (
          <div className="relative">
            <Select
              value={value}
              onValueChange={onChange}
              disabled={isDisabled || isLoading}
            >
              <SelectTrigger className={inputSize}>
                <SelectValue 
                  placeholder={
                    field.placeholder ||
                    (isLoading 
                      ? 'Loading...' 
                      : isDisabled 
                      ? `Select ${field.dependencyKey} first`
                      : `Select ${field.label}`)
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {options.map((option, optionIndex) => (
                  <SelectItem key={`${field.key}-${option.value}-${optionIndex}`} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isLoading && (
              <div className="absolute inset-y-0 right-10 flex items-center pointer-events-none">
                <Loader2 className={`animate-spin text-muted-foreground ${
                  responsive.isMobile ? 'w-3 h-3' : 'w-4 h-4'
                }`} />
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <FieldWrapper>
      <LabelWithHelp />
      {renderFieldInput()}
      {/* Mobile-specific field info */}
      {responsive.isMobile && field.helpText && (
        <p className="text-xs text-muted-foreground mt-1">
          {field.helpText}
        </p>
      )}
    </FieldWrapper>
  );
};