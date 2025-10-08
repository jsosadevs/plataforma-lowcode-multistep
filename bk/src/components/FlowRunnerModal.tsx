import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useFlowService } from '../hooks/useFlowService';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Separator } from './ui/separator';
import { 
  Loader2, CheckCircle, AlertCircle, Info, ChevronRight, Menu, X, 
  Settings, Grid3X3, List, LayoutGrid, Columns, Eye, Edit3,
  GripVertical, ArrowUpDown, Palette, Monitor, Smartphone, ChevronLeft,
  FileText, HelpCircle, Lightbulb, AlertTriangle, Clock, Target,
  BookOpen, MessageSquare, Zap, Layers, Star, CheckSquare, Database
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { FormField, FormFieldOption } from '../types/flow';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { LayoutEngine } from './LayoutEngine';
import { ResponsiveLayoutWrapper, useResponsiveModalLayout } from './ResponsiveLayoutWrapper';
import { CustomInfoArea } from './CustomInfoArea';

interface FlowRunnerModalProps {
  flowId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (flowData: any) => void;
  enableDesignMode?: boolean;
  fullScreenDesigner?: boolean;
}

type ViewMode = 'default' | 'cards' | 'grid' | 'compact' | 'minimal';
type FieldLayout = 'single' | 'two-column' | 'auto';

export const FlowRunnerModal: React.FC<FlowRunnerModalProps> = ({
  flowId,
  isOpen,
  onClose,
  onComplete,
  enableDesignMode = false,
  fullScreenDesigner = false
}) => {
  const { getFlow, flowState, startFlow, advanceFlow, regressFlow, fetchOptions } = useFlowService();
  const { responsive, modalConfig, getModalClasses, getContentClasses, getTabsClasses, shouldShowElement } = useResponsiveModalLayout();
  const [dynamicForm, setDynamicForm] = useState<{ [key: string]: any }>({});
  const [fieldOptions, setFieldOptions] = useState<{ [key: string]: FormFieldOption[] }>({});
  const [fieldLoading, setFieldLoading] = useState<{ [key: string]: boolean }>({});
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  // Layout and customization states
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('default');
  const [fieldLayout, setFieldLayout] = useState<FieldLayout>('single');
  const [fieldOrder, setFieldOrder] = useState<string[]>([]);
  
  // Enhanced navigation and layout states
  const [useHorizontalLayout, setUseHorizontalLayout] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [showCustomInfoArea, setShowCustomInfoArea] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [availableHeight, setAvailableHeight] = useState(0);
  
  // Custom info area states
  const [infoAreaMode, setInfoAreaMode] = useState<'step' | 'inputs' | 'auto'>('auto');
  const [selectedFieldForInfo, setSelectedFieldForInfo] = useState<string | null>(null);
  
  // Detect layout constraints and adapt
  useEffect(() => {
    const updateLayout = () => {
      if (containerRef.current) {
        const height = containerRef.current.clientHeight;
        setAvailableHeight(height);
        
        // Switch to horizontal layout if height is constrained
        const shouldUseHorizontal = height < 600 && responsive.isTablet;
        setUseHorizontalLayout(shouldUseHorizontal);
      }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [responsive.isTablet]);

  const flow = flowId ? getFlow(flowId) : null;

  // Initialize field order when step changes
  useEffect(() => {
    if (flowState.currentStep?.formFields) {
      setFieldOrder(flowState.currentStep.formFields.map(field => field.key));
    }
  }, [flowState.currentStep]);

  useEffect(() => {
    if (flow && isOpen) {
      startFlow(flow.id);
    }
  }, [flow, isOpen]);

  useEffect(() => {
    if (flowState.status === 'ready' && flowState.currentStep) {
      buildFormForStep();
      setupDynamicFields();
    } else {
      setFieldOptions({});
      setFieldLoading({});
    }
  }, [flowState]);

  const buildFormForStep = () => {
    const newForm: { [key: string]: any } = {};
    const step = flowState.currentStep;
    
    if (step) {
      step.formFields.forEach(field => {
        newForm[field.key] = flowState.completedStepsPayload[field.key] || '';
      });
    }
    
    setDynamicForm(newForm);
  };

  const setupDynamicFields = async () => {
    const fields = flowState.currentStep?.formFields || [];
    
    for (const field of fields) {
      if (field.type === 'select' && field.queryName && !field.dependencyKey) {
        await loadOptions(field, field);
      }
    }
  };

  const loadOptions = async (targetField: FormField, parentField: FormField, dependencyValue?: string) => {
    if (!targetField.queryName) return;

    setFieldLoading(prev => ({ ...prev, [targetField.key]: true }));

    try {
      const options = await fetchOptions(targetField.queryName, parentField, dependencyValue ?? '');
      setFieldOptions(prev => ({ ...prev, [targetField.key]: options }));
    } catch (error) {
      console.error(`Error loading options for ${targetField.key}:`, error);
    } finally {
      setFieldLoading(prev => ({ ...prev, [targetField.key]: false }));
    }
  };

  const handleFieldChange = async (fieldKey: string, value: any) => {
    setDynamicForm(prev => ({ ...prev, [fieldKey]: value }));

    const fields = flowState.currentStep?.formFields || [];
    const childField = fields.find(f => f.dependencyKey === fieldKey);
    
    if (childField) {
      setDynamicForm(prev => ({ ...prev, [childField.key]: '' }));
      setFieldOptions(prev => ({ ...prev, [childField.key]: [] }));
      
      if (value) {
        const parentField = fields.find(f => f.key === fieldKey)!;
        await loadOptions(childField, parentField, value);
      }
    }
  };

  const handleSubmit = () => {
    if (!flow || flowState.status !== 'ready' || !flowState.currentStep) return;

    if (!enableDesignMode) {
      const isValid = flowState.currentStep.formFields.every(field => {
        if (field.required) {
          const value = dynamicForm[field.key];
          return value !== undefined && value !== null && value !== '';
        }
        return true;
      });

      if (!isValid) return;
    }

    advanceFlow({
      flowId: flow.id,
      currentStepId: flowState.currentStep.id,
      payload: dynamicForm
    });
  };

  const handleBack = () => {
    if (flow) {
      regressFlow(flow.id);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleFieldReorder = (dragIndex: number, hoverIndex: number) => {
    const newOrder = [...fieldOrder];
    const draggedField = newOrder[dragIndex];
    newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, draggedField);
    setFieldOrder(newOrder);
  };

  // Get ordered fields based on current order
  const orderedFields = useMemo(() => {
    if (!flowState.currentStep?.formFields) return [];
    
    const fieldsMap = new Map(flowState.currentStep.formFields.map(field => [field.key, field]));
    return fieldOrder.map(key => fieldsMap.get(key)).filter(Boolean) as FormField[];
  }, [flowState.currentStep?.formFields, fieldOrder]);

  // Get UI configuration from flow and step
  const flowUIConfig = flow?.uiConfig || {};
  const stepUIConfig = flowState.currentStep?.uiConfig || {};
  
  // Apply UI configurations
  const effectiveViewMode = stepUIConfig.viewMode || viewMode;
  const effectiveFieldLayout = stepUIConfig.fieldLayout || fieldLayout;
  const modalSize = flowUIConfig.modalSize || 'w-screen h-screen max-w-none';
  const showSidebar = flowUIConfig.showSidebar !== false;
  const progressStyle = flowUIConfig.progressStyle || 'bar';
  const spacing = stepUIConfig.spacing || 'md';
  const columns = stepUIConfig.columns || 2;
  
  // Ensure layout configuration exists with defaults
  const layoutConfig = flowUIConfig.layout || {
    preset: 'sidebar-left',
    customLayout: false,
    fullscreen: false,
    modalBehaviour: 'responsive',
    areas: []
  };
  
  const useCustomLayout = layoutConfig.customLayout || false;
  const layoutAreas = layoutConfig.areas || [];
  const layoutPreset = layoutConfig.preset || 'sidebar-left';

  const renderField = (field: FormField, index: number) => {
    const value = dynamicForm[field.key] || '';
    const isLoading = fieldLoading[field.key] || false;
    const options = fieldOptions[field.key] || [];
    const isDisabled = field.dependencyKey && !dynamicForm[field.dependencyKey];

    const LabelWithHelp = () => (
      <div className="flex items-center gap-2">
        <Label htmlFor={field.key}>
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {field.helpText && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="inline-flex items-center justify-center">
                <Info className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <p className="text-sm">{field.helpText}</p>
            </TooltipContent>
          </Tooltip>
        )}
        {enableDesignMode && isCustomizing && (
          <div className="flex items-center gap-1 ml-auto">
            <button
              type="button"
              className="opacity-50 hover:opacity-100 cursor-grab active:cursor-grabbing"
              onMouseDown={(e) => {
                const isUp = e.shiftKey;
                const currentIndex = orderedFields.findIndex(f => f.key === field.key);
                const newIndex = isUp ? Math.max(0, currentIndex - 1) : Math.min(orderedFields.length - 1, currentIndex + 1);
                handleFieldReorder(currentIndex, newIndex);
              }}
            >
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );

    const FieldWrapper = ({ children }: { children: React.ReactNode }) => {
      const animationClass = stepUIConfig.animation === 'fade' ? 'animate-in fade-in duration-300' :
                           stepUIConfig.animation === 'slide' ? 'animate-in slide-in-from-left duration-300' :
                           stepUIConfig.animation === 'scale' ? 'animate-in zoom-in duration-300' : '';

      if (effectiveViewMode === 'cards') {
        return (
          <Card className={`hover:shadow-sm transition-shadow ${animationClass}`}>
            <CardContent className="pt-4">
              {children}
            </CardContent>
          </Card>
        );
      }
      
      if (effectiveViewMode === 'minimal') {
        return (
          <div className={`border-l-2 border-primary/20 pl-3 hover:border-primary/40 transition-colors ${animationClass}`}>
            {children}
          </div>
        );
      }

      if (effectiveViewMode === 'compact') {
        return (
          <div className={`space-y-1 ${animationClass}`}>
            {children}
          </div>
        );
      }

      if (effectiveViewMode === 'wizard') {
        return (
          <div className={`p-4 border rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 ${animationClass}`}>
            {children}
          </div>
        );
      }

      return <div className={`space-y-2 ${animationClass}`}>{children}</div>;
    };

    const renderFieldInput = () => {
      // Enhanced base props with better focus management
      const baseProps = {
        onFocus: () => {
          if (infoAreaMode === 'auto' || infoAreaMode === 'inputs') {
            setSelectedFieldForInfo(field.key);
            setShowCustomInfoArea(true); // Ensure info area is visible when focusing
          }
        },
        onBlur: () => {
          if (infoAreaMode === 'auto') {
            // Delay hiding to allow clicking on related info
            setTimeout(() => {
              setSelectedFieldForInfo(null);
            }, 150);
          }
        }
      };

      // Enhanced select props with focus management
      const selectProps = {
        onOpenChange: (isOpen: boolean) => {
          if (isOpen) {
            if (infoAreaMode === 'auto' || infoAreaMode === 'inputs') {
              setSelectedFieldForInfo(field.key);
              setShowCustomInfoArea(true);
            }
          } else if (infoAreaMode === 'auto') {
            setTimeout(() => {
              setSelectedFieldForInfo(null);
            }, 150);
          }
        }
      };

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
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="w-full"
              disabled={isDisabled}
              {...baseProps}
            />
          );

        case 'textarea':
          return (
            <Textarea
              id={field.key}
              value={value}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              rows={viewMode === 'compact' ? 2 : 4}
              className="w-full resize-none"
              disabled={isDisabled}
              {...baseProps}
            />
          );

        case 'select':
          return (
            <div 
              className="relative"
              onFocus={() => baseProps.onFocus()}
              onBlur={() => baseProps.onBlur()}
            >
              <Select
                value={value}
                onValueChange={(newValue) => handleFieldChange(field.key, newValue)}
                disabled={isDisabled || isLoading}
                {...selectProps}
              >
                <SelectTrigger>
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
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          );

        case 'checkbox':
          return (
            <div 
              className="flex items-center space-x-2"
              onFocus={() => baseProps.onFocus()}
              onBlur={() => baseProps.onBlur()}
            >
              <input
                id={field.key}
                type="checkbox"
                checked={!!value}
                onChange={(e) => handleFieldChange(field.key, e.target.checked)}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-ring focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isDisabled}
              />
              <Label htmlFor={field.key} className="text-sm font-normal cursor-pointer">
                {field.label}
              </Label>
            </div>
          );

        default:
          return (
            <div 
              className="p-3 border border-dashed border-muted-foreground/30 rounded-md text-center text-muted-foreground"
              onFocus={() => baseProps.onFocus()}
              onBlur={() => baseProps.onBlur()}
            >
              <span className="text-sm">Unsupported field type: {field.type}</span>
            </div>
          );
      }
    };

    return (
      <FieldWrapper>
        <LabelWithHelp />
        {renderFieldInput()}
      </FieldWrapper>
    );
  };

  const CustomizationPanel = () => (
    <div className={`space-y-4 border rounded-lg bg-muted/20 ${
      responsive.isMobile ? 'p-3' : 'p-4'
    }`}>
      <div className="flex items-center justify-between">
        <h4 className={`font-medium flex items-center gap-2 ${
          responsive.isMobile ? 'text-sm' : ''
        }`}>
          <Palette className={responsive.isMobile ? 'w-3 h-3' : 'w-4 h-4'} />
          {responsive.isMobile ? 'Customize' : 'Customize Layout'}
        </h4>
        <Button
          variant="ghost"
          size={responsive.isMobile ? 'sm' : 'sm'}
          onClick={() => setIsCustomizing(!isCustomizing)}
        >
          {isCustomizing ? 'Done' : 'Edit'}
        </Button>
      </div>

      <div className={responsive.isMobile ? 'space-y-3' : 'grid grid-cols-2 gap-3'}>
        <div className="space-y-2">
          <Label className={`font-medium ${responsive.isMobile ? 'text-sm' : 'text-xs'}`}>
            View Style
          </Label>
          <Select value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
            <SelectTrigger className={responsive.isMobile ? 'h-9' : 'h-8'}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="view-default" value="default">
                <div className="flex items-center gap-2">
                  <List className="w-3 h-3" />
                  Default
                </div>
              </SelectItem>
              <SelectItem key="view-cards" value="cards">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-3 h-3" />
                  Cards
                </div>
              </SelectItem>
              <SelectItem key="view-grid" value="grid">
                <div className="flex items-center gap-2">
                  <Grid3X3 className="w-3 h-3" />
                  Grid
                </div>
              </SelectItem>
              <SelectItem key="view-compact" value="compact">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-3 h-3" />
                  Compact
                </div>
              </SelectItem>
              <SelectItem key="view-minimal" value="minimal">
                <div className="flex items-center gap-2">
                  <Monitor className="w-3 h-3" />
                  Minimal
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className={`font-medium ${responsive.isMobile ? 'text-sm' : 'text-xs'}`}>
            Field Layout
          </Label>
          <Select value={fieldLayout} onValueChange={(value) => setFieldLayout(value as FieldLayout)}>
            <SelectTrigger className={responsive.isMobile ? 'h-9' : 'h-8'}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="layout-single" value="single">
                {responsive.isMobile ? 'Single' : 'Single Column'}
              </SelectItem>
              <SelectItem key="layout-two-column" value="two-column">
                {responsive.isMobile ? 'Two Cols' : 'Two Columns'}
              </SelectItem>
              <SelectItem key="layout-auto" value="auto">
                {responsive.isMobile ? 'Auto' : 'Auto Layout'}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isCustomizing && (
        <div className="pt-2 border-t">
          <p className={`text-muted-foreground ${
            responsive.isMobile ? 'text-xs' : 'text-xs'
          }`}>
            {responsive.isMobile 
              ? 'Shift + click ↕ to reorder fields'
              : 'Use Shift + click the ↕ icon next to field labels to reorder fields'
            }
          </p>
        </div>
      )}
    </div>
  );

  if (!flow || !isOpen) return null;

  const steps = flow.steps;
  const currentStepIndex = flowState.currentStepIndex ?? -1;
  const isFirstStep = currentStepIndex === 0;
  const isStepWithFinalQuery = !!flowState.currentStep?.queryChain?.length;
  const isSubmittingFinalStep = (currentStepIndex + 1) >= steps.length;

  // Progress percentage
  const progressPercentage = steps.length > 0 ? ((currentStepIndex + 1) / steps.length) * 100 : 0;

  // Get field layout classes based on UI config and responsive state
  const getFieldLayoutClasses = () => {
    return getContentClasses(orderedFields.length);
  };

  // Sidebar content with responsive design
  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className={`border-b bg-gradient-to-br from-primary/5 to-primary/10 ${
        responsive.isMobile ? 'px-4 py-4' : 'px-6 py-6'
      }`}>
        <div className="min-w-0">
          <h3 className={`font-semibold mb-1 truncate ${
            responsive.isMobile ? 'text-base' : 'text-lg'
          }`}>
            {flow.name}
          </h3>
          {shouldShowElement('description') && flow.description && (
            <p className={`text-muted-foreground line-clamp-2 ${
              responsive.isMobile ? 'text-xs' : 'text-sm'
            }`}>
              {flow.description}
            </p>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{currentStepIndex + 1} of {steps.length}</span>
          </div>
          <div className={`bg-muted rounded-full overflow-hidden ${
            responsive.isMobile ? 'h-1.5' : 'h-2'
          }`}>
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <nav className={`space-y-2 ${responsive.isMobile ? 'p-2' : 'p-4'}`}>
          {steps.map((step, i) => {
            const isCompleted = i < currentStepIndex || flowState.status === 'completed' || flowState.status === 'final-result';
            const isCurrent = i === currentStepIndex;
            const isUpcoming = i > currentStepIndex;

            return (
              <div
                key={`step-${step.id}-${i}`}
                className={`
                  relative flex items-start transition-all duration-200
                  ${responsive.isMobile ? 'gap-2 p-2 rounded-md' : 'gap-3 p-3 rounded-lg'}
                  ${isCurrent ? 'bg-primary/10 shadow-sm' : ''}
                  ${isCompleted ? 'opacity-70 hover:opacity-100' : ''}
                  ${isUpcoming ? 'opacity-50' : ''}
                `}
              >
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className={`
                    absolute w-0.5 transition-colors
                    ${responsive.isMobile 
                      ? 'left-[18px] top-[36px] h-[calc(100%+4px)]' 
                      : 'left-[22px] top-[44px] h-[calc(100%+8px)]'
                    }
                    ${isCompleted ? 'bg-primary' : 'bg-muted'}
                  `} />
                )}
                
                {/* Step indicator */}
                <div className="relative flex-shrink-0 z-10">
                  {isCompleted ? (
                    <div className={`
                      rounded-full bg-primary flex items-center justify-center shadow-sm
                      ${responsive.isMobile ? 'w-6 h-6' : 'w-8 h-8'}
                    `}>
                      <CheckCircle className={`text-primary-foreground ${
                        responsive.isMobile ? 'w-3 h-3' : 'w-4 h-4'
                      }`} />
                    </div>
                  ) : (
                    <div className={`
                      rounded-full flex items-center justify-center font-semibold
                      ${responsive.isMobile ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'}
                      ${isCurrent 
                        ? 'bg-primary text-primary-foreground shadow-sm ring-4 ring-primary/20' 
                        : 'bg-muted text-muted-foreground'}
                    `}>
                      {i + 1}
                    </div>
                  )}
                </div>
                
                {/* Step content */}
                <div className="flex-1 min-w-0 pt-1">
                  <p className={`
                    font-medium truncate
                    ${responsive.isMobile ? 'text-xs' : 'text-sm'}
                    ${isCurrent ? 'text-foreground' : isCompleted ? 'text-muted-foreground' : 'text-muted-foreground/70'}
                  `}>
                    {step.name}
                  </p>
                  {shouldShowElement('description') && step.description && (
                    <p className={`text-muted-foreground mt-0.5 line-clamp-2 ${
                      responsive.isMobile ? 'text-xs' : 'text-xs'
                    }`}>
                      {step.description}
                    </p>
                  )}
                  {isCurrent && step.formFields.length > 0 && shouldShowElement('badges') && (
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className={responsive.isMobile ? 'text-xs px-1.5 py-0.5' : 'text-xs'}>
                        {step.formFields.length} field{step.formFields.length !== 1 ? 's' : ''}
                      </Badge>
                      {viewMode !== 'default' && (
                        <Badge variant="outline" className={`capitalize ${
                          responsive.isMobile ? 'text-xs px-1.5 py-0.5' : 'text-xs'
                        }`}>
                          {viewMode}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );

  // Enhanced navigation controls
  const NavigationControls = () => (
    <div className={`fixed top-4 right-4 z-50 flex gap-2 navigation-controls ${
      responsive.isMobile ? 'top-2 right-2' : ''
    }`}>
      {/* Step navigation */}
      <div className="flex items-center gap-1 bg-background/90 backdrop-blur-sm border rounded-lg p-1 shadow-lg">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              disabled={isFirstStep || flowState.status === 'processing'}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Previous Step</TooltipContent>
        </Tooltip>
        
        <div className="px-3 py-1 text-sm font-medium text-muted-foreground">
          {currentStepIndex + 1}/{steps.length}
        </div>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSubmit}
              disabled={flowState.status === 'processing'}
              className="h-8 w-8 p-0"
            >
              {flowState.status === 'processing' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {isSubmittingFinalStep ? 'Finish Flow' : 'Next Step'}
          </TooltipContent>
        </Tooltip>
      </div>
      
      {/* Close button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 bg-background/90 backdrop-blur-sm border shadow-lg"
          >
            <X className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Close Flow</TooltipContent>
      </Tooltip>
    </div>
  );

  // Detailed information panel for complex flows
  const DetailedInfoPanel = () => {
    const step = flowState.currentStep;
    if (!step) return null;

    const hasDetailedInfo = step.description || step.helpText || step.formFields.some(f => f.helpText) ||
                           step.estimatedTime || step.requirements?.length || step.tips?.length || step.warnings?.length;
    
    if (!hasDetailedInfo) return null;

    return (
      <div className="space-y-4">
        <Card className="border-l-4 border-l-primary bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Step Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {step.description && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Info className="h-3 w-3" />
                  Description
                </h4>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            )}
            
            {step.helpText && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <HelpCircle className="h-3 w-3" />
                  Help
                </h4>
                <p className="text-sm text-muted-foreground">{step.helpText}</p>
              </div>
            )}
            
            {step.estimatedTime && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Estimated Time
                </h4>
                <p className="text-sm text-muted-foreground">{step.estimatedTime}</p>
              </div>
            )}

            {step.requirements && step.requirements.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  Requirements
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {step.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {step.tips && step.tips.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Lightbulb className="h-3 w-3 text-blue-500" />
                  Tips
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {step.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {step.warnings && step.warnings.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-amber-500" />
                  Important Notes
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {step.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {step.formFields.some(f => f.helpText) && (
          <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                <CardTitle className="text-sm">Field Guidelines</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {step.formFields.filter(f => f.helpText).map(field => (
                  <div key={field.key} className="text-sm">
                    <div className="font-medium text-blue-700 mb-1">{field.label}</div>
                    <p className="text-blue-600">{field.helpText}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Use the external CustomInfoArea component
  const CustomInfoAreaComponent = () => {
    const step = flowState.currentStep;
    if (!step) return null;

    return (
      <CustomInfoArea
        step={step}
        flow={flow}
        selectedFieldForInfo={selectedFieldForInfo}
        infoAreaMode={infoAreaMode}
        enableDesignMode={enableDesignMode}
        onInfoAreaModeChange={setInfoAreaMode}
        onSelectedFieldChange={setSelectedFieldForInfo}
      />
    );
  };

  // Carousel navigation for constrained layouts
  const CarouselContent = ({ children }: { children: React.ReactNode }) => {
    if (!useHorizontalLayout) return <>{children}</>;

    const totalItems = 4; // Steps, Form, Details, Custom Info
    const canNavigate = totalItems > 1;

    return (
      <div className="relative h-full overflow-hidden">
        <div 
          className="flex h-full transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
        >
          <div className="w-full flex-shrink-0">
            <SidebarContent />
          </div>
          <div className="w-full flex-shrink-0 p-4">
            {children}
          </div>
          <div className="w-full flex-shrink-0 p-4">
            <DetailedInfoPanel />
          </div>
          <div className="w-full flex-shrink-0 p-4">
            <CustomInfoAreaComponent />
          </div>
        </div>
        
        {canNavigate && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-background/90 backdrop-blur-sm border rounded-lg p-2 shadow-lg">
            {[
              { label: 'Steps', icon: List },
              { label: 'Form', icon: Edit3 },
              { label: 'Info', icon: Info },
              { label: 'Guide', icon: BookOpen }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => setCarouselIndex(index)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                    index === carouselIndex 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {responsive.isTablet && item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Content Components for Layout Engine with responsive design
  const MainContent = () => {
    const contentPadding = responsive.isMobile ? 'p-4' : responsive.isTablet ? 'p-6' : 'p-8 lg:p-12';
    
    // Check if we should show detailed info panel and custom info area
    const step = flowState.currentStep;
    const hasDetailedInfo = step?.description || step?.helpText || step?.formFields.some(f => f.helpText);
    const hasCustomInfo = step?.customInfo?.enabled !== false || flow?.customInfo?.enabled !== false;
    
    useEffect(() => {
      setShowDetailPanel(hasDetailedInfo && !responsive.isMobile);
      setShowCustomInfoArea(hasCustomInfo && !responsive.isMobile);
    }, [hasDetailedInfo, hasCustomInfo, responsive.isMobile]);
    
    const contentComponent = (
      <div ref={containerRef} className={contentPadding}>
          {flowState.status === 'loading' && (
            <div className={`flex flex-col items-center justify-center ${
              responsive.isMobile ? 'min-h-[300px]' : 'min-h-[400px]'
            }`}>
              <div className="relative">
                <Loader2 className={`text-primary animate-spin ${
                  responsive.isMobile ? 'w-8 h-8' : 'w-12 h-12'
                }`} />
                <div className={`absolute inset-0 border-4 border-primary/20 rounded-full ${
                  responsive.isMobile ? 'w-8 h-8' : 'w-12 h-12'
                }`} />
              </div>
              <p className={`mt-6 text-muted-foreground ${
                responsive.isMobile ? 'text-sm' : ''
              }`}>Processing...</p>
            </div>
          )}

          {flowState.status === 'ready' && flowState.currentStep && (
            <div className="w-full">
              {/* Mobile progress indicator */}
              {responsive.isMobile && (
                <div className="mb-6 pt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>Step {currentStepIndex + 1} of {steps.length}</span>
                    <span>{Math.round(progressPercentage)}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              <header className={responsive.isMobile ? 'mb-6' : 'mb-8'}>
                <div className={`flex items-center gap-2 text-muted-foreground mb-3 ${
                  responsive.isMobile ? 'text-xs' : 'text-sm'
                }`}>
                  <span>Step {currentStepIndex + 1} of {steps.length}</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-foreground font-medium truncate flex-1 min-w-0">
                    {flowState.currentStep.name}
                  </span>
                </div>
                <h2 className={`font-semibold mb-2 ${
                  responsive.isMobile ? 'text-lg' : responsive.isTablet ? 'text-xl' : 'text-2xl'
                }`}>
                  {flowState.currentStep.name}
                </h2>
                {shouldShowElement('description') && flowState.currentStep.description && (
                  <p className={`text-muted-foreground ${
                    responsive.isMobile ? 'text-sm' : 'text-base max-w-2xl'
                  }`}>
                    {flowState.currentStep.description}
                  </p>
                )}
              </header>

              {/* Design Mode Indicator */}
              {enableDesignMode && (
                <div className={responsive.isMobile ? 'mb-4' : 'mb-6'}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className={`gap-2 cursor-help border-blue-200 bg-blue-50 text-blue-700 ${
                        responsive.isMobile ? 'text-xs px-2 py-1' : ''
                      }`}>
                        <Eye className={responsive.isMobile ? 'w-3 h-3' : 'w-4 h-4'} />
                        {responsive.isMobile ? 'Preview Mode' : 'Preview Mode - Validation disabled'}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p className="text-sm">
                        You can navigate through all steps without filling required fields. 
                        This mode is only available in the Backoffice for UI design and testing purposes.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}

              {/* Customization Panel - Solo visible en modo de diseño */}
              {enableDesignMode && flowState.currentStep.formFields.length > 0 && (
                <div className={responsive.isMobile ? 'mb-6' : 'mb-8 lg:mb-12'}>
                  <CustomizationPanel />
                </div>
              )}
              
              <Card className="border-0 shadow-none bg-background">
                <CardContent className={responsive.isMobile ? 'p-4' : 'p-6'}>
                  <div className={getFieldLayoutClasses()}>
                    {orderedFields.map((field, index) => (
                      <div key={`${flowState.currentStep?.id}-${field.key}-${index}`} className="space-y-2">
                        {renderField(field, index)}
                      </div>
                    ))}
                    
                    {flowState.currentStep.formFields.length === 0 && (
                      <Alert className="border-blue-200 bg-blue-50">
                        <Info className={`text-blue-600 ${responsive.isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                        <AlertDescription className={`text-blue-800 ${
                          responsive.isMobile ? 'text-sm' : ''
                        }`}>
                          This is a confirmation step. Click "{isStepWithFinalQuery ? 'Finish & Run Query' : (isSubmittingFinalStep ? 'Finish' : 'Next')}" to continue.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {flowState.status === 'final-result' && (
            <div className="w-full">
              <header className={responsive.isMobile ? 'mb-6' : 'mb-8'}>
                <div className={`inline-flex items-center justify-center rounded-full bg-green-100 mb-6 ${
                  responsive.isMobile ? 'w-12 h-12' : 'w-16 h-16'
                }`}>
                  <CheckCircle className={`text-green-600 ${
                    responsive.isMobile ? 'w-6 h-6' : 'w-8 h-8'
                  }`} />
                </div>
                <h2 className={`font-semibold ${
                  responsive.isMobile ? 'text-xl' : responsive.isTablet ? 'text-2xl' : 'text-3xl lg:text-4xl'
                }`}>
                  Query Executed Successfully!
                </h2>
                <p className={`mt-3 text-muted-foreground ${
                  responsive.isMobile ? 'text-base' : 'text-lg'
                }`}>
                  The final query has been processed. Below are the results.
                </p>
              </header>
              <div className="bg-muted/50 rounded-lg p-8 border">
                <ScrollArea className="h-[50vh] min-h-[400px]">
                  <pre className="text-sm">
                    <code>{JSON.stringify(flowState.finalQueryResult, null, 2)}</code>
                  </pre>
                </ScrollArea>
              </div>
            </div>
          )}

          {(flowState.status === 'completed' || flowState.status === 'final-result') && (
            <div className="flex justify-center mt-8">
              <Button 
                onClick={handleClose} 
                size={responsive.isMobile ? 'default' : 'lg'}
                className={responsive.isMobile ? 'w-full max-w-xs' : ''}
              >
                Close
              </Button>
            </div>
          )}

          {flowState.status === 'ready' && flowState.currentStep && !useHorizontalLayout && (
            <div className={`border-t border-border/50 flex justify-between ${
              responsive.isMobile 
                ? 'mt-6 pt-4 flex-col gap-3' 
                : 'mt-8 pt-8 flex-col sm:flex-row gap-4'
            }`}>
              <div className={`flex ${responsive.isMobile ? 'order-2' : 'gap-3'}`}>
                {!isFirstStep && (
                  <Button 
                    variant="outline" 
                    onClick={handleBack}
                    disabled={flowState.status === 'processing'}
                    size={responsive.isMobile ? 'sm' : 'default'}
                    className={responsive.isMobile ? 'flex-1' : ''}
                  >
                    <ChevronLeft className={`mr-2 ${
                      responsive.isMobile ? 'w-3 h-3' : 'w-4 h-4'
                    }`} />
                    Back
                  </Button>
                )}
              </div>
              
              <div className={`flex ${responsive.isMobile ? 'gap-2' : 'gap-3'}`}>
                <Button 
                  onClick={handleSubmit}
                  disabled={flowState.status === 'processing'}
                  className={responsive.isMobile ? 'flex-1' : 'min-w-[120px]'}
                  size={responsive.isMobile ? 'sm' : 'default'}
                >
                  {flowState.status === 'processing' ? (
                    <>
                      <Loader2 className={`animate-spin mr-2 ${
                        responsive.isMobile ? 'w-3 h-3' : 'w-4 h-4'
                      }`} />
                      {responsive.isMobile ? 'Processing...' : 'Processing...'}
                    </>
                  ) : (
                    <>
                      {responsive.isMobile 
                        ? (isSubmittingFinalStep ? 'Finish' : 'Next')
                        : (isStepWithFinalQuery ? 'Finish & Run Query' : (isSubmittingFinalStep ? 'Finish' : 'Next'))
                      }
                      <ChevronRight className={`ml-2 ${
                        responsive.isMobile ? 'w-3 h-3' : 'w-4 h-4'
                      }`} />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      );

    // Return content based on layout mode
    if (useHorizontalLayout) {
      return (
        <div className="flex-1 relative">
          <CarouselContent>{contentComponent}</CarouselContent>
          <NavigationControls />
        </div>
      );
    }
    
    // Traditional vertical layout - panel handled by ResponsiveLayoutWrapper
    return (
      <div className="flex-1 relative">
        <ScrollArea className="h-full">
          {contentComponent}
        </ScrollArea>
        <NavigationControls />
      </div>
    );
  };

  const HeaderContent = () => (
    <div className="p-4 border-b bg-background">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{flow?.name}</h3>
        <Badge variant="outline">
          Step {currentStepIndex + 1} of {steps.length}
        </Badge>
      </div>
      <div className="mt-2">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );

  const FooterContent = () => (
    <div className="p-4 border-t bg-background">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={handleClose}>
          Cancel
        </Button>
        <div className="flex gap-2">
          {!isFirstStep && (
            <Button variant="outline" size="sm" onClick={handleBack}>
              Back
            </Button>
          )}
          <Button size="sm" onClick={handleSubmit}>
            {isSubmittingFinalStep ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );

  const NavigationContent = () => (
    <div className="p-4">
      <div className="space-y-2">
        {steps.map((step, i) => {
          const isCompleted = i < currentStepIndex;
          const isCurrent = i === currentStepIndex;
          
          return (
            <div
              key={`nav-${step.id}-${i}`}
              className={`flex items-center gap-3 p-2 rounded-md text-sm ${
                isCurrent ? 'bg-primary/10 text-primary' : 
                isCompleted ? 'text-muted-foreground' : 'text-muted-foreground/50'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                isCompleted ? 'bg-primary text-primary-foreground' :
                isCurrent ? 'bg-primary text-primary-foreground' :
                'bg-muted text-muted-foreground'
              }`}>
                {isCompleted ? <CheckCircle className="w-3 h-3" /> : i + 1}
              </div>
              <span className="truncate">{step.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className={getModalClasses(`
          shadow-2xl 
          [&>[data-slot=dialog-close]]:rounded-full 
          [&>[data-slot=dialog-close]]:bg-background/80 
          [&>[data-slot=dialog-close]]:backdrop-blur-sm 
          [&>[data-slot=dialog-close]]:border 
          [&>[data-slot=dialog-close]]:shadow-lg
          ${responsive.isMobile 
            ? '[&>[data-slot=dialog-close]]:w-8 [&>[data-slot=dialog-close]]:h-8 [&>[data-slot=dialog-close]]:top-2 [&>[data-slot=dialog-close]]:right-2'
            : '[&>[data-slot=dialog-close]]:w-10 [&>[data-slot=dialog-close]]:h-10 [&>[data-slot=dialog-close]]:top-4 [&>[data-slot=dialog-close]]:right-4'
          }
        `)}>
          {/* Accessibility - Hidden title and description */}
          <DialogTitle className="sr-only">{flow?.name || 'Flow'}</DialogTitle>
          <DialogDescription className="sr-only">{flow?.description || 'Flow description'}</DialogDescription>
          
          {/* Conditional Layout Rendering */}
          {useCustomLayout && layoutAreas.length > 0 ? (
            /* Custom Layout Engine */
            <LayoutEngine
              areas={layoutAreas}
              children={{
                sidebar: <SidebarContent />,
                main: <MainContent />,
                header: <HeaderContent />,
                footer: <FooterContent />,
                navigation: <NavigationContent />
              }}
              className="h-full"
              uiConfig={{
                accentColor: flowUIConfig.accentColor,
                primaryColor: flowUIConfig.primaryColor,
                sidebarBackground: flowUIConfig.sidebarBackground,
                sidebarBorder: flowUIConfig.sidebarBorder,
                mainBackground: flowUIConfig.mainBackground,
                mainBorderRadius: flowUIConfig.mainBorderRadius
              }}
            />
          ) : (
            /* Traditional Responsive Layout */
            <ResponsiveLayoutWrapper
              title={flow?.name}
              description={flow?.description}
              onClose={!useHorizontalLayout ? onClose : undefined}
              enableDesignMode={enableDesignMode}
              useHorizontalLayout={useHorizontalLayout}
              showDetailPanel={showDetailPanel}
              showCustomInfoArea={showCustomInfoArea}
            >
              {{
                sidebar: showSidebar && !useHorizontalLayout ? <SidebarContent /> : undefined,
                main: <MainContent />,
                details: showDetailPanel && !useHorizontalLayout ? <DetailedInfoPanel /> : undefined,
                customInfo: showCustomInfoArea && !useHorizontalLayout ? <CustomInfoAreaComponent /> : undefined
              }}
            </ResponsiveLayoutWrapper>
          )}
        </DialogContent>
      </Dialog>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={showMobileSidebar} onOpenChange={setShowMobileSidebar}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Flow Steps</SheetTitle>
            <SheetDescription>Navigate through the flow steps</SheetDescription>
          </SheetHeader>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
};