import React, { useState, useEffect } from 'react';
import { Flow, FlowUIConfig, StepUIConfig, FieldUIConfig, UITemplate, ViewMode, FieldLayout, ColorTheme, SpacingSize } from '../types/flow';
import { useFlowService } from '../hooks/useFlowService';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { 
  Palette, Eye, Monitor, Smartphone, Settings, Layout, Grid3X3, 
  List, LayoutGrid, Columns, Square, Circle, Triangle, 
  Save, RotateCcw, Wand2, Copy, Download, Upload, 
  ChevronRight, ChevronDown, Move, Trash2, Plus, 
  Zap, Sparkles, Layers, PaintBucket, Sliders,
  ArrowLeft, ArrowRight, Play, ChevronLeft, Info, CreditCard
} from 'lucide-react';
import { FlowRunnerModal } from './FlowRunnerModal';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { FieldReorderTool } from './FieldReorderTool';
import { UIPreviewPane } from './UIPreviewPane';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './ui/resizable';
import { LayoutCustomizer } from './LayoutCustomizer';
import { toast } from 'sonner@2.0.3';

interface FlowUIDesignerProps {
  flowId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (flowId: string, uiConfig: FlowUIConfig) => void;
}

// Predefined UI Templates
const UI_TEMPLATES: UITemplate[] = [
  {
    id: 'modern-card',
    name: 'Modern Cards',
    description: 'Clean card-based layout with smooth animations',
    category: 'business',
    layoutPreset: 'sidebar-left',
    flowConfig: {
      theme: 'primary',
      progressStyle: 'bar',
      headerStyle: 'detailed',
      animation: 'smooth'
    },
    stepConfig: {
      viewMode: 'cards',
      fieldLayout: 'two-column',
      spacing: 'md',
      showProgress: true,
      animation: 'fade'
    },
    layoutVariants: [
      {
        layoutId: 'sidebar-left',
        accentColor: '#3b82f6',
        primaryColor: '#1e40af',
        headerStyle: 'detailed',
        progressPosition: 'sidebar',
        sidebarStyle: {
          background: '#f8fafc',
          borderColor: '#e2e8f0',
          textColor: '#1e293b'
        },
        mainContentStyle: {
          background: '#ffffff',
          padding: 'lg',
          borderRadius: 'lg'
        }
      },
      {
        layoutId: 'sidebar-right',
        accentColor: '#3b82f6',
        primaryColor: '#1e40af',
        headerStyle: 'compact',
        progressPosition: 'sidebar',
        sidebarStyle: {
          background: '#eff6ff',
          borderColor: '#bfdbfe',
          textColor: '#1e40af'
        },
        mainContentStyle: {
          background: '#ffffff',
          padding: 'lg',
          borderRadius: 'md'
        }
      },
      {
        layoutId: 'three-panel',
        accentColor: '#3b82f6',
        primaryColor: '#1e40af',
        headerStyle: 'detailed',
        progressPosition: 'header',
        mainContentStyle: {
          background: '#f8fafc',
          padding: 'md',
          borderRadius: 'md'
        }
      },
      {
        layoutId: 'full-width',
        accentColor: '#3b82f6',
        primaryColor: '#1e40af',
        headerStyle: 'minimal',
        progressPosition: 'header',
        mainContentStyle: {
          background: '#ffffff',
          padding: 'xl',
          borderRadius: 'lg'
        }
      },
      {
        layoutId: 'wizard-mode',
        accentColor: '#3b82f6',
        primaryColor: '#1e40af',
        headerStyle: 'detailed',
        progressPosition: 'header',
        mainContentStyle: {
          background: '#ffffff',
          padding: 'lg',
          borderRadius: 'md'
        }
      },
      {
        layoutId: 'vertical-split',
        accentColor: '#3b82f6',
        primaryColor: '#1e40af',
        headerStyle: 'compact',
        progressPosition: 'inline',
        mainContentStyle: {
          background: '#f8fafc',
          padding: 'md',
          borderRadius: 'md'
        }
      }
    ]
  },
  {
    id: 'minimal-list',
    name: 'Minimal List',
    description: 'Simple, focused list layout',
    category: 'simple',
    layoutPreset: 'full-width',
    flowConfig: {
      theme: 'default',
      progressStyle: 'dots',
      headerStyle: 'minimal',
      animation: 'fast'
    },
    stepConfig: {
      viewMode: 'minimal',
      fieldLayout: 'single',
      spacing: 'sm',
      showProgress: false,
      animation: 'none'
    },
    layoutVariants: [
      {
        layoutId: 'full-width',
        accentColor: '#64748b',
        primaryColor: '#475569',
        headerStyle: 'minimal',
        progressPosition: 'header',
        mainContentStyle: {
          background: '#ffffff',
          padding: 'lg',
          borderRadius: 'sm'
        }
      },
      {
        layoutId: 'wizard-mode',
        accentColor: '#64748b',
        primaryColor: '#475569',
        headerStyle: 'minimal',
        progressPosition: 'header',
        mainContentStyle: {
          background: '#f8fafc',
          padding: 'md',
          borderRadius: 'sm'
        }
      },
      {
        layoutId: 'vertical-split',
        accentColor: '#64748b',
        primaryColor: '#475569',
        headerStyle: 'minimal',
        progressPosition: 'inline',
        mainContentStyle: {
          background: '#ffffff',
          padding: 'md',
          borderRadius: 'sm'
        }
      }
    ]
  },
  {
    id: 'creative-grid',
    name: 'Creative Grid',
    description: 'Dynamic grid layout with vibrant colors',
    category: 'creative',
    layoutPreset: 'sidebar-right',
    flowConfig: {
      theme: 'info',
      progressStyle: 'steps',
      headerStyle: 'compact',
      animation: 'smooth'
    },
    stepConfig: {
      viewMode: 'grid',
      fieldLayout: 'auto',
      columns: 3,
      spacing: 'lg',
      showProgress: true,
      animation: 'scale'
    },
    layoutVariants: [
      {
        layoutId: 'sidebar-right',
        accentColor: '#06b6d4',
        primaryColor: '#0891b2',
        headerStyle: 'compact',
        progressPosition: 'sidebar',
        sidebarStyle: {
          background: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)',
          borderColor: '#67e8f9',
          textColor: '#164e63'
        },
        mainContentStyle: {
          background: '#ffffff',
          padding: 'lg',
          borderRadius: 'xl'
        }
      },
      {
        layoutId: 'three-panel',
        accentColor: '#06b6d4',
        primaryColor: '#0891b2',
        headerStyle: 'detailed',
        progressPosition: 'header',
        mainContentStyle: {
          background: '#f0fdfa',
          padding: 'md',
          borderRadius: 'lg'
        }
      },
      {
        layoutId: 'sidebar-left',
        accentColor: '#06b6d4',
        primaryColor: '#0891b2',
        headerStyle: 'compact',
        progressPosition: 'sidebar',
        sidebarStyle: {
          background: '#ecfeff',
          borderColor: '#a5f3fc',
          textColor: '#155e75'
        },
        mainContentStyle: {
          background: '#ffffff',
          padding: 'lg',
          borderRadius: 'lg'
        }
      }
    ]
  },
  {
    id: 'wizard-flow',
    name: 'Wizard Flow',
    description: 'Step-by-step wizard interface',
    category: 'technical',
    layoutPreset: 'wizard-mode',
    flowConfig: {
      theme: 'success',
      progressStyle: 'steps',
      headerStyle: 'detailed',
      animation: 'smooth'
    },
    stepConfig: {
      viewMode: 'wizard',
      fieldLayout: 'single',
      spacing: 'lg',
      showProgress: true,
      showDescription: true,
      animation: 'slide'
    },
    layoutVariants: [
      {
        layoutId: 'wizard-mode',
        accentColor: '#10b981',
        primaryColor: '#059669',
        headerStyle: 'detailed',
        progressPosition: 'header',
        mainContentStyle: {
          background: '#ffffff',
          padding: 'xl',
          borderRadius: 'lg'
        }
      },
      {
        layoutId: 'full-width',
        accentColor: '#10b981',
        primaryColor: '#059669',
        headerStyle: 'detailed',
        progressPosition: 'header',
        mainContentStyle: {
          background: '#f0fdf4',
          padding: 'xl',
          borderRadius: 'md'
        }
      },
      {
        layoutId: 'vertical-split',
        accentColor: '#10b981',
        primaryColor: '#059669',
        headerStyle: 'compact',
        progressPosition: 'inline',
        mainContentStyle: {
          background: '#ffffff',
          padding: 'lg',
          borderRadius: 'lg'
        }
      }
    ]
  },
  {
    id: 'compact-mobile',
    name: 'Mobile Compact',
    description: 'Optimized for mobile devices',
    category: 'simple',
    layoutPreset: 'full-width',
    flowConfig: {
      theme: 'default',
      progressStyle: 'bar',
      headerStyle: 'compact',
      animation: 'fast'
    },
    stepConfig: {
      viewMode: 'compact',
      fieldLayout: 'single',
      spacing: 'sm',
      showProgress: true,
      showDescription: false,
      animation: 'fade'
    },
    layoutVariants: [
      {
        layoutId: 'full-width',
        accentColor: '#71717a',
        primaryColor: '#52525b',
        headerStyle: 'compact',
        progressPosition: 'header',
        mainContentStyle: {
          background: '#ffffff',
          padding: 'sm',
          borderRadius: 'md'
        }
      },
      {
        layoutId: 'wizard-mode',
        accentColor: '#71717a',
        primaryColor: '#52525b',
        headerStyle: 'compact',
        progressPosition: 'header',
        mainContentStyle: {
          background: '#fafafa',
          padding: 'md',
          borderRadius: 'sm'
        }
      }
    ]
  },
  {
    id: 'dashboard-style',
    name: 'Dashboard Style',
    description: 'Professional dashboard appearance',
    category: 'business',
    layoutPreset: 'three-panel',
    flowConfig: {
      theme: 'primary',
      progressStyle: 'steps',
      headerStyle: 'detailed',
      animation: 'smooth'
    },
    stepConfig: {
      viewMode: 'cards',
      fieldLayout: 'auto',
      columns: 3,
      spacing: 'md',
      showProgress: true,
      showDescription: true,
      animation: 'scale'
    },
    layoutVariants: [
      {
        layoutId: 'three-panel',
        accentColor: '#6366f1',
        primaryColor: '#4f46e5',
        headerStyle: 'detailed',
        progressPosition: 'header',
        mainContentStyle: {
          background: '#f8fafc',
          padding: 'md',
          borderRadius: 'lg'
        }
      },
      {
        layoutId: 'sidebar-left',
        accentColor: '#6366f1',
        primaryColor: '#4f46e5',
        headerStyle: 'detailed',
        progressPosition: 'sidebar',
        sidebarStyle: {
          background: '#eef2ff',
          borderColor: '#c7d2fe',
          textColor: '#3730a3'
        },
        mainContentStyle: {
          background: '#ffffff',
          padding: 'lg',
          borderRadius: 'lg'
        }
      },
      {
        layoutId: 'sidebar-right',
        accentColor: '#6366f1',
        primaryColor: '#4f46e5',
        headerStyle: 'compact',
        progressPosition: 'sidebar',
        sidebarStyle: {
          background: '#f5f3ff',
          borderColor: '#ddd6fe',
          textColor: '#5b21b6'
        },
        mainContentStyle: {
          background: '#ffffff',
          padding: 'lg',
          borderRadius: 'md'
        }
      }
    ]
  },
  {
    id: 'form-focused',
    name: 'Form Focused',
    description: 'Clean, form-centric design',
    category: 'business',
    layoutPreset: 'vertical-split',
    flowConfig: {
      theme: 'default',
      progressStyle: 'dots',
      headerStyle: 'minimal',
      animation: 'smooth'
    },
    stepConfig: {
      viewMode: 'default',
      fieldLayout: 'two-column',
      spacing: 'md',
      showProgress: false,
      showDescription: false,
      animation: 'fade'
    },
    layoutVariants: [
      {
        layoutId: 'vertical-split',
        accentColor: '#8b5cf6',
        primaryColor: '#7c3aed',
        headerStyle: 'minimal',
        progressPosition: 'inline',
        mainContentStyle: {
          background: '#ffffff',
          padding: 'lg',
          borderRadius: 'md'
        }
      },
      {
        layoutId: 'full-width',
        accentColor: '#8b5cf6',
        primaryColor: '#7c3aed',
        headerStyle: 'minimal',
        progressPosition: 'header',
        mainContentStyle: {
          background: '#faf5ff',
          padding: 'xl',
          borderRadius: 'lg'
        }
      },
      {
        layoutId: 'sidebar-left',
        accentColor: '#8b5cf6',
        primaryColor: '#7c3aed',
        headerStyle: 'compact',
        progressPosition: 'sidebar',
        sidebarStyle: {
          background: '#f3e8ff',
          borderColor: '#e9d5ff',
          textColor: '#6b21a8'
        },
        mainContentStyle: {
          background: '#ffffff',
          padding: 'lg',
          borderRadius: 'md'
        }
      }
    ]
  }
];

export const FlowUIDesigner: React.FC<FlowUIDesignerProps> = ({
  flowId,
  isOpen,
  onClose,
  onSave
}) => {
  const { getFlow, updateFlow } = useFlowService();
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('templates');
  const [previewFlow, setPreviewFlow] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showPreviewPane, setShowPreviewPane] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(true); // Inicia en pantalla completa
  const [layoutPreset, setLayoutPreset] = useState<string>('sidebar-left');
  const [layoutAreas, setLayoutAreas] = useState<any[]>([]);

  const flow = flowId ? getFlow(flowId) : null;
  const [localFlow, setLocalFlow] = useState<Flow | null>(null);

  useEffect(() => {
    if (flow && isOpen) {
      // Ensure flow has a default layout configuration
      const flowWithLayout = {
        ...flow,
        uiConfig: {
          ...flow.uiConfig,
          layout: flow.uiConfig?.layout || {
            preset: 'sidebar-left', // Default layout preset
            customLayout: false,
            fullscreen: false,
            modalBehaviour: 'responsive' as const,
            areas: []
          }
        }
      };
      
      setLocalFlow(flowWithLayout);
      if (flow.steps.length > 0) {
        setSelectedStep(flow.steps[0].id);
      }
      
      // Initialize layout state from flow config
      const layoutConfig = flowWithLayout.uiConfig.layout;
      setLayoutPreset(layoutConfig.preset || 'sidebar-left');
      setLayoutAreas(layoutConfig.areas || []);
    }
  }, [flow, isOpen]);

  const updateFlowUIConfig = (config: Partial<FlowUIConfig>) => {
    if (!localFlow) return;
    
    const updatedFlow = {
      ...localFlow,
      uiConfig: { ...localFlow.uiConfig, ...config }
    };
    setLocalFlow(updatedFlow);
    setIsDirty(true);
  };

  const updateStepUIConfig = (stepId: string, config: Partial<StepUIConfig>) => {
    if (!localFlow) return;

    const updatedFlow = {
      ...localFlow,
      steps: localFlow.steps.map(step => 
        step.id === stepId 
          ? { ...step, uiConfig: { ...step.uiConfig, ...config } }
          : step
      )
    };
    setLocalFlow(updatedFlow);
    setIsDirty(true);
  };

  const updateLayoutConfig = (layoutConfig: any) => {
    if (!localFlow) return;
    
    const updatedFlow = {
      ...localFlow,
      uiConfig: { 
        ...localFlow.uiConfig, 
        layout: { 
          ...localFlow.uiConfig?.layout, 
          ...layoutConfig 
        } 
      }
    };
    setLocalFlow(updatedFlow);
    setIsDirty(true);
  };

  const updateFieldUIConfig = (stepId: string, fieldKey: string, config: Partial<FieldUIConfig>) => {
    if (!localFlow) return;

    const updatedFlow = {
      ...localFlow,
      steps: localFlow.steps.map(step => 
        step.id === stepId 
          ? {
              ...step,
              formFields: step.formFields.map(field =>
                field.key === fieldKey
                  ? { ...field, uiConfig: { ...field.uiConfig, ...config } }
                  : field
              )
            }
          : step
      )
    };
    setLocalFlow(updatedFlow);
    setIsDirty(true);
  };

  const reorderStepFields = (stepId: string, reorderedFields: any[]) => {
    if (!localFlow) return;

    const updatedFlow = {
      ...localFlow,
      steps: localFlow.steps.map(step => 
        step.id === stepId 
          ? { ...step, formFields: reorderedFields }
          : step
      )
    };
    setLocalFlow(updatedFlow);
    setIsDirty(true);
  };

  // Helper: Find the current template based on flow's theme
  const getCurrentTemplate = () => {
    const currentTheme = localFlow?.uiConfig?.theme;
    return UI_TEMPLATES.find(t => t.flowConfig.theme === currentTheme) || UI_TEMPLATES[0];
  };

  // Helper: Apply layout variant from current template
  const applyLayoutVariant = (layoutId: string) => {
    const currentTemplate = getCurrentTemplate();
    const layoutVariant = currentTemplate.layoutVariants?.find(v => v.layoutId === layoutId);
    
    if (!layoutVariant) {
      return {}; // No specific variant, use defaults
    }

    return {
      accentColor: layoutVariant.accentColor,
      primaryColor: layoutVariant.primaryColor,
      headerStyle: layoutVariant.headerStyle,
      // Additional styling based on variant
      ...(layoutVariant.sidebarStyle && {
        sidebarBackground: layoutVariant.sidebarStyle.background,
        sidebarBorder: layoutVariant.sidebarStyle.borderColor,
        sidebarText: layoutVariant.sidebarStyle.textColor
      }),
      ...(layoutVariant.mainContentStyle && {
        mainBackground: layoutVariant.mainContentStyle.background,
        mainPadding: layoutVariant.mainContentStyle.padding,
        mainBorderRadius: layoutVariant.mainContentStyle.borderRadius
      })
    };
  };

  const applyTemplate = (template: UITemplate) => {
    if (!localFlow || !flowId) return;

    const presetId = template.layoutPreset;
    
    // Get layout variant styling from template
    const layoutVariant = template.layoutVariants?.find(v => v.layoutId === presetId);
    const variantStyles = layoutVariant ? {
      accentColor: layoutVariant.accentColor,
      primaryColor: layoutVariant.primaryColor,
      headerStyle: layoutVariant.headerStyle,
      ...(layoutVariant.sidebarStyle && {
        sidebarBackground: layoutVariant.sidebarStyle.background,
        sidebarBorder: layoutVariant.sidebarStyle.borderColor,
        sidebarText: layoutVariant.sidebarStyle.textColor
      }),
      ...(layoutVariant.mainContentStyle && {
        mainBackground: layoutVariant.mainContentStyle.background,
        mainPadding: layoutVariant.mainContentStyle.padding,
        mainBorderRadius: layoutVariant.mainContentStyle.borderRadius
      })
    } : {};
    
    const updatedFlow = {
      ...localFlow,
      uiConfig: {
        ...template.flowConfig,
        ...variantStyles, // Apply variant-specific styling
        // Apply layout preset from template
        layout: {
          preset: presetId,
          customLayout: false,
          fullscreen: false,
          modalBehaviour: 'responsive' as const,
          areas: [] // Areas will be populated by LayoutCustomizer based on preset
        }
      },
      steps: localFlow.steps.map(step => ({
        ...step,
        uiConfig: {
          // Preserve existing step UI config and merge with template
          ...step.uiConfig,
          ...template.stepConfig
        }
      }))
    };
    
    // Update layout state to match template
    setLayoutPreset(presetId);
    setLayoutAreas([]); // Reset custom areas when applying template
    
    // Update local flow state
    setLocalFlow(updatedFlow);
    
    // Save immediately with the updated flow
    updateFlow(updatedFlow);
    onSave?.(flowId, updatedFlow.uiConfig || {});
    setIsDirty(false);
    
    toast.success('Template Applied', {
      description: `"${template.name}" template with ${presetId.replace(/-/g, ' ')} layout has been applied successfully.`
    });
  };

  const handleSave = () => {
    if (!localFlow || !flowId) return;

    updateFlow(localFlow);
    onSave?.(flowId, localFlow.uiConfig || {});
    setIsDirty(false);
    
    toast.success('Changes Saved', {
      description: 'All UI configuration changes have been saved successfully.'
    });
  };

  const handleReset = () => {
    if (flow) {
      setLocalFlow({ ...flow });
      setIsDirty(false);
    }
  };

  const handlePreview = () => {
    if (!localFlow) return;
    // Temporarily update the flow for preview
    updateFlow(localFlow);
    setPreviewFlow(localFlow.id);
  };

  const selectedStepData = localFlow?.steps.find(step => step.id === selectedStep);

  const FieldsConfigTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold mb-2">Field Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Reorder fields and customize their appearance and behavior.
          </p>
        </div>
        
        <Select value={selectedStep || ''} onValueChange={setSelectedStep}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select a step" />
          </SelectTrigger>
          <SelectContent>
            {localFlow?.steps.map((step, index) => (
              <SelectItem key={step.id} value={step.id}>
                Step {index + 1}: {step.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedStepData && (
        <FieldReorderTool
          fields={selectedStepData.formFields}
          onReorder={(reorderedFields) => reorderStepFields(selectedStep!, reorderedFields)}
          onFieldUpdate={(fieldKey, updates) => updateFieldUIConfig(selectedStep!, fieldKey, updates.uiConfig || {})}
        />
      )}
    </div>
  );

  if (!flow || !isOpen) return null;

  const TemplatesTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-2">Choose a Template</h3>
        <p className="text-sm text-muted-foreground">
          Start with a pre-designed template for styling and behavior. Templates work alongside your layout configuration.
        </p>
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Adaptive Templates with Layout Variants</p>
              <p>Each template includes multiple layout variants with optimized styling. When you switch layouts, colors, spacing, and visual elements automatically adapt to maintain design consistency.</p>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <Sparkles className="w-3 h-3" />
                <span className="font-medium">Smart Theming:</span>
                <span>Templates + Layouts work together seamlessly</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {UI_TEMPLATES.map((template) => (
          <Card 
            key={template.id} 
            className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50"
            onClick={() => applyTemplate(template)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <Badge variant="outline" className="text-xs capitalize">
                    {template.category}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm mb-3">
                {template.description}
              </CardDescription>
              
              {/* Layout Preview Badge */}
              <div className="mb-3 p-2 bg-primary/5 rounded-md border border-primary/10">
                <div className="flex items-center gap-2 text-xs mb-1">
                  <Layout className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">Default Layout:</span>
                  <span className="text-muted-foreground capitalize">
                    {template.layoutPreset.replace(/-/g, ' ')}
                  </span>
                </div>
                {template.layoutVariants && template.layoutVariants.length > 1 && (
                  <div className="flex items-center gap-1 mt-2 pl-6">
                    <span className="text-xs text-muted-foreground">
                      +{template.layoutVariants.length - 1} layout variant{template.layoutVariants.length > 2 ? 's' : ''}
                    </span>
                    <Badge variant="secondary" className="text-xs h-4 px-1">
                      Adaptive
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Other specs */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {template.stepConfig.viewMode}
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">
                  {template.flowConfig.theme}
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">
                  {template.flowConfig.animation}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const FlowConfigTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-2">Flow Configuration</h3>
        <p className="text-sm text-muted-foreground">
          Configure the overall appearance and behavior of the flow modal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Modal Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Modal Size</Label>
              <Select 
                value={localFlow?.uiConfig?.modalSize || 'lg'} 
                onValueChange={(value) => updateFlowUIConfig({ modalSize: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sm">Small</SelectItem>
                  <SelectItem value="md">Medium</SelectItem>
                  <SelectItem value="lg">Large</SelectItem>
                  <SelectItem value="xl">Extra Large</SelectItem>
                  <SelectItem value="full">Full Screen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Theme</Label>
              <Select 
                value={localFlow?.uiConfig?.theme || 'default'} 
                onValueChange={(value) => updateFlowUIConfig({ theme: value as ColorTheme })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="danger">Danger</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Animation Speed</Label>
              <Select 
                value={localFlow?.uiConfig?.animation || 'smooth'} 
                onValueChange={(value) => updateFlowUIConfig({ animation: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="fast">Fast</SelectItem>
                  <SelectItem value="smooth">Smooth</SelectItem>
                  <SelectItem value="slow">Slow</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Layout className="w-4 h-4" />
              Layout Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Show Sidebar</Label>
              <Switch 
                checked={localFlow?.uiConfig?.showSidebar !== false}
                onCheckedChange={(checked) => updateFlowUIConfig({ showSidebar: checked })}
              />
            </div>

            {localFlow?.uiConfig?.showSidebar !== false && (
              <div className="space-y-2">
                <Label>Sidebar Position</Label>
                <Select 
                  value={localFlow?.uiConfig?.sidebarPosition || 'left'} 
                  onValueChange={(value) => updateFlowUIConfig({ sidebarPosition: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Progress Style</Label>
              <Select 
                value={localFlow?.uiConfig?.progressStyle || 'bar'} 
                onValueChange={(value) => updateFlowUIConfig({ progressStyle: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Progress Bar</SelectItem>
                  <SelectItem value="dots">Dots</SelectItem>
                  <SelectItem value="steps">Step Indicators</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Header Style</Label>
              <Select 
                value={localFlow?.uiConfig?.headerStyle || 'default'} 
                onValueChange={(value) => updateFlowUIConfig({ headerStyle: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const StepConfigTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold mb-2">Step Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Configure the appearance of individual steps.
          </p>
        </div>
        
        <Select value={selectedStep || ''} onValueChange={setSelectedStep}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select a step" />
          </SelectTrigger>
          <SelectContent>
            {localFlow?.steps.map((step, index) => (
              <SelectItem key={step.id} value={step.id}>
                Step {index + 1}: {step.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedStepData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <LayoutGrid className="w-4 h-4" />
                View Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Display Style</Label>
                <Select 
                  value={selectedStepData.uiConfig?.viewMode || 'default'} 
                  onValueChange={(value) => updateStepUIConfig(selectedStep!, { viewMode: value as ViewMode })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">
                      <div className="flex items-center gap-2">
                        <List className="w-3 h-3" />
                        Default
                      </div>
                    </SelectItem>
                    <SelectItem value="cards">
                      <div className="flex items-center gap-2">
                        <Square className="w-3 h-3" />
                        Cards
                      </div>
                    </SelectItem>
                    <SelectItem value="grid">
                      <div className="flex items-center gap-2">
                        <Grid3X3 className="w-3 h-3" />
                        Grid
                      </div>
                    </SelectItem>
                    <SelectItem value="compact">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-3 h-3" />
                        Compact
                      </div>
                    </SelectItem>
                    <SelectItem value="minimal">
                      <div className="flex items-center gap-2">
                        <Circle className="w-3 h-3" />
                        Minimal
                      </div>
                    </SelectItem>
                    <SelectItem value="wizard">
                      <div className="flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        Wizard
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Field Layout</Label>
                <Select 
                  value={selectedStepData.uiConfig?.fieldLayout || 'single'} 
                  onValueChange={(value) => updateStepUIConfig(selectedStep!, { fieldLayout: value as FieldLayout })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Column</SelectItem>
                    <SelectItem value="two-column">Two Columns</SelectItem>
                    <SelectItem value="three-column">Three Columns</SelectItem>
                    <SelectItem value="auto">Auto Layout</SelectItem>
                    <SelectItem value="inline">Inline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(selectedStepData.uiConfig?.viewMode === 'grid' || selectedStepData.uiConfig?.fieldLayout === 'auto') && (
                <div className="space-y-2">
                  <Label>Columns</Label>
                  <Select 
                    value={selectedStepData.uiConfig?.columns?.toString() || '2'} 
                    onValueChange={(value) => updateStepUIConfig(selectedStep!, { columns: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Column</SelectItem>
                      <SelectItem value="2">2 Columns</SelectItem>
                      <SelectItem value="3">3 Columns</SelectItem>
                      <SelectItem value="4">4 Columns</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Spacing & Animation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Spacing</Label>
                <Select 
                  value={selectedStepData.uiConfig?.spacing || 'md'} 
                  onValueChange={(value) => updateStepUIConfig(selectedStep!, { spacing: value as SpacingSize })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xs">Extra Small</SelectItem>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                    <SelectItem value="xl">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Animation</Label>
                <Select 
                  value={selectedStepData.uiConfig?.animation || 'none'} 
                  onValueChange={(value) => updateStepUIConfig(selectedStep!, { animation: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="fade">Fade</SelectItem>
                    <SelectItem value="slide">Slide</SelectItem>
                    <SelectItem value="scale">Scale</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Padding</Label>
                <Select 
                  value={selectedStepData.uiConfig?.padding || 'md'} 
                  onValueChange={(value) => updateStepUIConfig(selectedStep!, { padding: value as SpacingSize })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xs">Extra Small</SelectItem>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                    <SelectItem value="xl">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Show Progress</Label>
                <Switch 
                  checked={selectedStepData.uiConfig?.showProgress !== false}
                  onCheckedChange={(checked) => updateStepUIConfig(selectedStep!, { showProgress: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Show Description</Label>
                <Switch 
                  checked={selectedStepData.uiConfig?.showDescription !== false}
                  onCheckedChange={(checked) => updateStepUIConfig(selectedStep!, { showDescription: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  const StepConfigTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-2">Step Configuration</h3>
        <p className="text-sm text-muted-foreground">
          Configure individual step settings, appearance, and behavior.
        </p>
      </div>

      {selectedStep && selectedStepData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="w-4 h-4" />
                View Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>View Mode</Label>
                <Select 
                  value={selectedStepData.uiConfig?.viewMode || 'default'} 
                  onValueChange={(value) => updateStepUIConfig(selectedStep!, { viewMode: value as ViewMode })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-3 h-3" />
                        Default
                      </div>
                    </SelectItem>
                    <SelectItem value="cards">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-3 h-3" />
                        Cards
                      </div>
                    </SelectItem>
                    <SelectItem value="grid">
                      <div className="flex items-center gap-2">
                        <Grid3X3 className="w-3 h-3" />
                        Grid
                      </div>
                    </SelectItem>
                    <SelectItem value="compact">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-3 h-3" />
                        Compact
                      </div>
                    </SelectItem>
                    <SelectItem value="minimal">
                      <div className="flex items-center gap-2">
                        <Circle className="w-3 h-3" />
                        Minimal
                      </div>
                    </SelectItem>
                    <SelectItem value="wizard">
                      <div className="flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        Wizard
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Field Layout</Label>
                <Select 
                  value={selectedStepData.uiConfig?.fieldLayout || 'single'} 
                  onValueChange={(value) => updateStepUIConfig(selectedStep!, { fieldLayout: value as FieldLayout })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Column</SelectItem>
                    <SelectItem value="two-column">Two Columns</SelectItem>
                    <SelectItem value="three-column">Three Columns</SelectItem>
                    <SelectItem value="auto">Auto Layout</SelectItem>
                    <SelectItem value="inline">Inline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(selectedStepData.uiConfig?.viewMode === 'grid' || selectedStepData.uiConfig?.fieldLayout === 'auto') && (
                <div className="space-y-2">
                  <Label>Columns</Label>
                  <Select 
                    value={selectedStepData.uiConfig?.columns?.toString() || '2'} 
                    onValueChange={(value) => updateStepUIConfig(selectedStep!, { columns: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Column</SelectItem>
                      <SelectItem value="2">2 Columns</SelectItem>
                      <SelectItem value="3">3 Columns</SelectItem>
                      <SelectItem value="4">4 Columns</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Spacing & Animation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Spacing</Label>
                <Select 
                  value={selectedStepData.uiConfig?.spacing || 'md'} 
                  onValueChange={(value) => updateStepUIConfig(selectedStep!, { spacing: value as SpacingSize })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xs">Extra Small</SelectItem>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                    <SelectItem value="xl">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Animation</Label>
                <Select 
                  value={selectedStepData.uiConfig?.animation || 'none'} 
                  onValueChange={(value) => updateStepUIConfig(selectedStep!, { animation: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="fade">Fade</SelectItem>
                    <SelectItem value="slide">Slide</SelectItem>
                    <SelectItem value="scale">Scale</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Padding</Label>
                <Select 
                  value={selectedStepData.uiConfig?.padding || 'md'} 
                  onValueChange={(value) => updateStepUIConfig(selectedStep!, { padding: value as SpacingSize })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xs">Extra Small</SelectItem>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                    <SelectItem value="xl">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Show Progress</Label>
                <Switch 
                  checked={selectedStepData.uiConfig?.showProgress !== false}
                  onCheckedChange={(checked) => updateStepUIConfig(selectedStep!, { showProgress: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Show Description</Label>
                <Switch 
                  checked={selectedStepData.uiConfig?.showDescription !== false}
                  onCheckedChange={(checked) => updateStepUIConfig(selectedStep!, { showDescription: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Select a step to configure settings</p>
        </div>
      )}
    </div>
  );

  const FieldsConfigTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-2">Field Configuration</h3>
        <p className="text-sm text-muted-foreground">
          Configure individual field settings and behavior.
        </p>
      </div>
      
      {selectedStep && selectedStepData ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Step: {selectedStepData.name}</CardTitle>
              <CardDescription>Configure fields for this step</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedStepData.formFields.map((field, index) => (
                  <div key={field.key} className="p-3 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{field.label}</span>
                      <Badge variant="outline">{field.type}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Key: {field.key}
                      {field.required && <Badge variant="secondary" className="ml-2">Required</Badge>}
                    </div>
                  </div>
                ))}
                {selectedStepData.formFields.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No fields configured for this step</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Select a step to configure fields</p>
        </div>
      )}
    </div>
  );

  const LayoutConfigTab = () => {
    const currentTemplate = getCurrentTemplate();
    const hasVariants = currentTemplate.layoutVariants && currentTemplate.layoutVariants.length > 0;
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Layout Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Customize the modal layout, areas, and positioning to create the perfect user experience.
          </p>
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Layout className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-800">
                <p className="font-medium mb-1">Smart Layout + Theme Integration</p>
                <p>Each template has optimized styling for different layouts. When you change the layout, colors, spacing, and visual elements automatically adapt to maintain the theme's aesthetic.</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Current theme: {currentTemplate.name}
                  </Badge>
                  {hasVariants && (
                    <Badge variant="outline" className="text-xs">
                      {currentTemplate.layoutVariants!.length} variants available
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Show available variants for current template */}
          {hasVariants && (
            <div className="mt-4 p-4 border border-primary/20 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Available Layout Variants for {currentTemplate.name}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {currentTemplate.layoutVariants!.map((variant) => {
                  const isActive = layoutPreset === variant.layoutId;
                  return (
                    <div 
                      key={variant.layoutId}
                      className={`p-2 rounded-md border text-xs ${
                        isActive 
                          ? 'border-primary bg-primary/10 text-primary font-medium' 
                          : 'border-border bg-background text-muted-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {isActive && <Badge variant="default" className="h-3 w-3 p-0 rounded-full" />}
                        <span className="capitalize">{variant.layoutId.replace(/-/g, ' ')}</span>
                      </div>
                      {variant.headerStyle && (
                        <div className="mt-1 text-xs opacity-75">
                          {variant.headerStyle} header
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <LayoutCustomizer
        currentPreset={layoutPreset}
        currentAreas={layoutAreas}
        onPresetChange={(preset) => {
          if (!localFlow || !flowId) return;
          
          setLayoutPreset(preset.id);
          setLayoutAreas(preset.areas);
          
          // Get layout variant styling from current template
          const variantConfig = applyLayoutVariant(preset.id);
          
          const updatedFlow = {
            ...localFlow,
            uiConfig: { 
              ...localFlow.uiConfig,
              // Apply variant-specific colors and styles
              ...(variantConfig.accentColor && { accentColor: variantConfig.accentColor }),
              ...(variantConfig.primaryColor && { primaryColor: variantConfig.primaryColor }),
              ...(variantConfig.headerStyle && { headerStyle: variantConfig.headerStyle }),
              layout: {
                preset: preset.id,
                areas: preset.areas,
                fullscreen: preset.fullscreen,
                customLayout: false,
                modalBehaviour: preset.fullscreen ? 'fullscreen' : 'responsive'
              }
            }
          };
          
          setLocalFlow(updatedFlow);
          updateFlow(updatedFlow);
          onSave?.(flowId, updatedFlow.uiConfig || {});
          setIsDirty(false);
          
          toast.success('Layout Updated', {
            description: `Preset "${preset.name}" with ${getCurrentTemplate().name} theme applied.`
          });
        }}
        onAreasChange={(areas) => {
          if (!localFlow || !flowId) return;
          
          setLayoutAreas(areas);
          
          const updatedFlow = {
            ...localFlow,
            uiConfig: { 
              ...localFlow.uiConfig, 
              layout: {
                ...localFlow.uiConfig?.layout,
                preset: layoutPreset,
                areas: areas,
                customLayout: true,
                modalBehaviour: 'responsive'
              }
            }
          };
          
          setLocalFlow(updatedFlow);
          updateFlow(updatedFlow);
          onSave?.(flowId, updatedFlow.uiConfig || {});
          setIsDirty(false);
          
          toast.success('Custom Layout Saved', {
            description: `Layout areas updated successfully.`
          });
        }}
        onReset={() => {
          if (!localFlow || !flowId) return;
          
          setLayoutPreset('sidebar-left');
          setLayoutAreas([]);
          
          const updatedFlow = {
            ...localFlow,
            uiConfig: { 
              ...localFlow.uiConfig, 
              layout: {
                preset: 'sidebar-left',
                areas: [],
                fullscreen: false,
                customLayout: false,
                modalBehaviour: 'responsive'
              }
            }
          };
          
          setLocalFlow(updatedFlow);
          updateFlow(updatedFlow);
          onSave?.(flowId, updatedFlow.uiConfig || {});
          setIsDirty(false);
          
          toast.success('Layout Reset', {
            description: 'Layout has been reset to default sidebar-left preset.'
          });
        }}
      />
    </div>
  );
};

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
          setIsFullScreen(true); // Reset to full screen for next time
          onClose();
        }
      }}>
        <DialogContent 
          className={`flex flex-col p-0 gap-0 overflow-hidden ${
            isFullScreen 
              ? 'fullscreen-modal !fixed !inset-0 !top-0 !left-0 !right-0 !bottom-0 !w-screen !h-screen !max-w-none !max-h-none !m-0 !translate-x-0 !translate-y-0 !transform-none !rounded-none !border-none [&>[data-slot=dialog-close]]:top-6 [&>[data-slot=dialog-close]]:right-6 [&>[data-slot=dialog-close]]:z-[100] data-[state=open]:!animate-none data-[state=closed]:!animate-none'
              : 'max-w-6xl h-[90vh]'
          }`}
          style={isFullScreen ? { 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            width: '100vw', 
            height: '100vh',
            maxWidth: '100vw',
            maxHeight: '100vh',
            margin: 0,
            padding: 0,
            transform: 'translate(0, 0)',
            borderRadius: 0,
            border: 'none',
            inset: '0'
          } : undefined}>
          <DialogHeader className={`${isFullScreen ? 'p-6 pb-4' : 'p-6 pb-0'} border-b bg-background shrink-0`}>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  UI Designer - {flow.name}
                  {isFullScreen && (
                    <Badge variant="outline" className="ml-2 gap-1 bg-blue-50 border-blue-200 text-blue-700">
                      <Monitor className="w-3 h-3" />
                      Full Screen
                    </Badge>
                  )}
                  {layoutAreas.length > 0 && (
                    <Badge variant="secondary" className="ml-2 gap-1 bg-green-50 border-green-200 text-green-700">
                      <Layout className="w-3 h-3" />
                      Custom Layout
                    </Badge>
                  )}
                  {isDirty && (
                    <Badge variant="outline" className="ml-2 gap-1 bg-orange-50 border-orange-200 text-orange-700">
                      <Save className="w-3 h-3" />
                      Unsaved
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {isFullScreen 
                    ? 'Full screen design mode - Complete workspace for UI customization'
                    : 'Customize the appearance and layout of your flow modal'
                  }
                </DialogDescription>
              </div>
              
              {/* Full Screen Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="gap-2"
                >
                  {isFullScreen ? (
                    <>
                      <Monitor className="w-4 h-4" />
                      Windowed Mode
                    </>
                  ) : (
                    <>
                      <Monitor className="w-4 h-4" />
                      Full Screen
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden min-h-0">
            {showPreviewPane ? (
              <ResizablePanelGroup direction="horizontal" className="h-full">
                {/* Configuration Panel */}
                <ResizablePanel defaultSize={60} minSize={30} maxSize={80}>
                  <div className="h-full p-6 pt-4 overflow-auto">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                      <TabsList className="grid w-full grid-cols-5 mb-4">
                        <TabsTrigger value="templates" className="flex items-center gap-2">
                          <Wand2 className="w-4 h-4" />
                          Templates
                        </TabsTrigger>
                        <TabsTrigger value="flow" className="flex items-center gap-2">
                          <Monitor className="w-4 h-4" />
                          Flow
                        </TabsTrigger>
                        <TabsTrigger value="steps" className="flex items-center gap-2">
                          <Layers className="w-4 h-4" />
                          Steps
                        </TabsTrigger>
                        <TabsTrigger value="fields" className="flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          Fields
                        </TabsTrigger>
                        <TabsTrigger value="layout" className="flex items-center gap-2">
                          <Layout className="w-4 h-4" />
                          Layout
                        </TabsTrigger>
                      </TabsList>

                      <ScrollArea className="flex-1">
                        <TabsContent value="templates" className="mt-0">
                          <TemplatesTab />
                        </TabsContent>
                        
                        <TabsContent value="flow" className="mt-0">
                          <FlowConfigTab />
                        </TabsContent>
                        
                        <TabsContent value="steps" className="mt-0">
                          <StepConfigTab />
                        </TabsContent>
                        
                        <TabsContent value="fields" className="mt-0">
                          <FieldsConfigTab />
                        </TabsContent>
                        
                        <TabsContent value="layout" className="mt-0">
                          <LayoutConfigTab />
                        </TabsContent>
                      </ScrollArea>
                    </Tabs>
                  </div>
                </ResizablePanel>

                {/* Resizable Handle with drag indicator */}
                <ResizableHandle withHandle className="w-1 bg-border hover:bg-primary/20 transition-colors" />

                {/* Preview Panel */}
                <ResizablePanel defaultSize={40} minSize={20} maxSize={70}>
                  <div className="h-full bg-muted/10 overflow-hidden flex flex-col">
                    <div className="p-4 border-b bg-background shrink-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-primary" />
                          <h3 className="font-semibold">Live Preview</h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPreviewPane(false)}
                          className="h-8 w-8 p-0"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <ScrollArea className="flex-1 p-4">
                      {localFlow && (
                        <UIPreviewPane
                          flow={localFlow}
                          selectedStep={selectedStepData}
                          deviceMode={deviceMode}
                          onDeviceModeChange={setDeviceMode}
                        />
                      )}
                    </ScrollArea>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            ) : (
              /* Single Panel View when preview is hidden */
              <div className="h-full p-6 pt-4 overflow-auto relative">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-5 mb-4">
                    <TabsTrigger value="templates" className="flex items-center gap-2">
                      <Wand2 className="w-4 h-4" />
                      Templates
                    </TabsTrigger>
                    <TabsTrigger value="flow" className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      Flow
                    </TabsTrigger>
                    <TabsTrigger value="steps" className="flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Steps
                    </TabsTrigger>
                    <TabsTrigger value="fields" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Fields
                    </TabsTrigger>
                    <TabsTrigger value="layout" className="flex items-center gap-2">
                      <Layout className="w-4 h-4" />
                      Layout
                    </TabsTrigger>
                  </TabsList>

                  <ScrollArea className="flex-1">
                    <TabsContent value="templates" className="mt-0">
                      <TemplatesTab />
                    </TabsContent>
                    
                    <TabsContent value="flow" className="mt-0">
                      <FlowConfigTab />
                    </TabsContent>
                    
                    <TabsContent value="steps" className="mt-0">
                      <StepConfigTab />
                    </TabsContent>
                    
                    <TabsContent value="fields" className="mt-0">
                      <FieldsConfigTab />
                    </TabsContent>
                    
                    <TabsContent value="layout" className="mt-0">
                      <LayoutConfigTab />
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
                
                {/* Show Preview Button when hidden */}
                <div className="absolute top-4 right-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreviewPane(true)}
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Show Preview
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="border-t bg-background p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isDirty && (
                  <Badge variant="outline" className="text-xs">
                    Unsaved changes
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={handleReset} disabled={!isDirty}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handlePreview}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button onClick={handleSave} disabled={!isDirty}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <FlowRunnerModal
        flowId={previewFlow}
        isOpen={!!previewFlow}
        onClose={() => setPreviewFlow(null)}
        onComplete={() => {}}
        enableDesignMode={true}
        fullScreenDesigner={isFullScreen}
      />
    </>
  );
};