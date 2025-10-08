import React from 'react';
import { Flow, FlowStep } from '../types/flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { Button } from './ui/button';
import { LayoutEngine } from './LayoutEngine';

interface UIPreviewPaneProps {
  flow: Flow;
  selectedStep?: FlowStep;
  deviceMode?: 'desktop' | 'tablet' | 'mobile';
  onDeviceModeChange?: (mode: 'desktop' | 'tablet' | 'mobile') => void;
}

export const UIPreviewPane: React.FC<UIPreviewPaneProps> = ({
  flow,
  selectedStep,
  deviceMode = 'desktop',
  onDeviceModeChange
}) => {
  // Ensure layout configuration exists with defaults
  const layoutConfig = flow.uiConfig?.layout || {
    preset: 'sidebar-left',
    customLayout: false,
    fullscreen: false,
    modalBehaviour: 'responsive',
    areas: []
  };
  
  const useCustomLayout = layoutConfig.customLayout || false;
  const layoutAreas = layoutConfig.areas || [];
  const layoutPreset = layoutConfig.preset || 'sidebar-left';
  const getDeviceWidth = () => {
    switch (deviceMode) {
      case 'mobile': return 'w-80';
      case 'tablet': return 'w-96';
      default: return 'w-full max-w-2xl';
    }
  };

  const getFieldLayoutClass = () => {
    const layout = selectedStep?.uiConfig?.fieldLayout || 'single';
    const spacing = selectedStep?.uiConfig?.spacing || 'md';
    
    const spacingClass = {
      'xs': 'gap-1',
      'sm': 'gap-2', 
      'md': 'gap-4',
      'lg': 'gap-6',
      'xl': 'gap-8'
    }[spacing];

    switch (layout) {
      case 'two-column': return `grid grid-cols-2 ${spacingClass}`;
      case 'three-column': return `grid grid-cols-3 ${spacingClass}`;
      case 'auto': return `grid grid-cols-2 ${spacingClass}`;
      case 'inline': return `flex flex-wrap ${spacingClass}`;
      default: return `space-y-${spacing === 'xs' ? '1' : spacing === 'sm' ? '2' : spacing === 'lg' ? '6' : spacing === 'xl' ? '8' : '4'}`;
    }
  };

  const renderFieldPreview = (field: any, index: number) => {
    const isHidden = field.uiConfig?.hidden;
    const width = field.uiConfig?.width || 'full';
    
    const widthClass = {
      'full': 'w-full',
      'half': 'w-1/2',
      'third': 'w-1/3',
      'quarter': 'w-1/4',
      'auto': 'w-auto'
    }[width];

    if (isHidden) return null;

    return (
      <div key={field.key} className={`${widthClass} min-w-0`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{field.label}</span>
            {field.required && (
              <span className="text-xs text-destructive">*</span>
            )}
          </div>
          <div className="h-9 bg-muted/50 border rounded-md flex items-center px-3">
            <span className="text-xs text-muted-foreground">
              {field.type === 'select' ? 'Select...' : `${field.type} input`}
            </span>
          </div>
          {field.helpText && (
            <span className="text-xs text-muted-foreground">{field.helpText}</span>
          )}
        </div>
      </div>
    );
  };

  // Get theme colors from uiConfig
  const accentColor = flow.uiConfig?.accentColor;
  const primaryColor = flow.uiConfig?.primaryColor;
  const headerStyle = flow.uiConfig?.headerStyle || 'default';
  
  // Header height based on style
  const getHeaderPadding = () => {
    switch (headerStyle) {
      case 'minimal': return 'py-3 px-4';
      case 'compact': return 'py-4 px-5';
      case 'detailed': return 'py-6 px-6';
      default: return 'py-4 px-6';
    }
  };

  // Preview Components for Layout Engine
  const HeaderPreview = () => (
    <CardHeader 
      className="border-b"
      style={{
        ...(primaryColor && { borderBottomColor: `${primaryColor}20` })
      }}
    >
      <div className={`flex items-center justify-between ${getHeaderPadding()}`}>
        <div>
          <CardTitle 
            className={headerStyle === 'minimal' ? 'text-base' : headerStyle === 'detailed' ? 'text-xl' : 'text-lg'}
            style={{ color: primaryColor || undefined }}
          >
            {flow.name}
          </CardTitle>
          {selectedStep && headerStyle !== 'minimal' && (
            <CardDescription>
              {selectedStep.name}
              {selectedStep.description && headerStyle === 'detailed' && ` - ${selectedStep.description}`}
            </CardDescription>
          )}
        </div>
        <Badge 
          variant="outline"
          style={{
            ...(accentColor && { 
              borderColor: accentColor,
              color: accentColor 
            })
          }}
        >
          {selectedStep ? `Step Preview` : 'Flow Preview'}
        </Badge>
      </div>
      
      {/* Progress Bar Preview */}
      {flow.uiConfig?.progressStyle === 'bar' && (
        <div className="w-full bg-muted rounded-full h-2 mt-2">
          <div 
            className="h-2 rounded-full w-1/3"
            style={{ backgroundColor: accentColor || 'hsl(var(--primary))' }}
          ></div>
        </div>
      )}
      
      {/* Dots Progress Preview */}
      {flow.uiConfig?.progressStyle === 'dots' && (
        <div className="flex gap-2 mt-2">
          {Array.from({ length: Math.min(flow.steps.length, 5) }).map((_, i) => (
            <div 
              key={i}
              className={`w-2 h-2 rounded-full ${i === 0 ? '' : 'bg-muted'}`}
              style={i === 0 ? { backgroundColor: accentColor || 'hsl(var(--primary))' } : {}}
            />
          ))}
        </div>
      )}
    </CardHeader>
  );

  const MainContentPreview = () => {
    // Get main content styling from uiConfig
    const mainBg = flow.uiConfig?.mainBackground;
    const mainPadding = flow.uiConfig?.mainPadding || 'md';
    const mainBorderRadius = flow.uiConfig?.mainBorderRadius || 'md';
    
    const getPaddingClass = () => {
      switch (mainPadding) {
        case 'sm': return 'p-3';
        case 'lg': return 'p-8';
        case 'xl': return 'p-10';
        default: return 'p-6';
      }
    };
    
    return (
      <CardContent 
        className={getPaddingClass()}
        style={{
          background: mainBg || undefined
        }}
      >
        {selectedStep ? (
          <div className={getFieldLayoutClass()}>
            {selectedStep.formFields.map(renderFieldPreview)}
          </div>
        ) : (
          <div className="space-y-4">
            {flow.steps.slice(0, 3).map((step, index) => (
              <div key={step.id} className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                    style={{
                      backgroundColor: accentColor ? `${accentColor}20` : 'hsl(var(--primary) / 0.2)',
                      color: accentColor || 'hsl(var(--primary))'
                    }}
                  >
                    {index + 1}
                  </div>
                  <span className="font-medium text-sm">{step.name}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {step.formFields.length} fields configured
                </div>
              </div>
            ))}
            {flow.steps.length > 3 && (
              <div className="text-center text-xs text-muted-foreground">
                +{flow.steps.length - 3} more steps
              </div>
            )}
          </div>
        )}
      </CardContent>
    );
  };

  const FooterPreview = () => (
    <div className="border-t p-4 bg-muted/30">
      <div className="flex justify-between">
        <Button variant="outline" disabled size="sm">
          Back
        </Button>
        <Button 
          disabled 
          size="sm"
          style={{
            backgroundColor: accentColor || undefined,
            borderColor: accentColor || undefined
          }}
        >
          Next
        </Button>
      </div>
    </div>
  );

  const SidebarPreview = () => {
    // Get sidebar styling from uiConfig if available
    const sidebarBg = flow.uiConfig?.sidebarBackground;
    const sidebarBorder = flow.uiConfig?.sidebarBorder;
    const sidebarText = flow.uiConfig?.sidebarText;
    
    return (
      <div 
        className="p-4 h-full"
        style={{
          background: sidebarBg || 'hsl(var(--muted) / 0.1)',
          ...(sidebarBorder && { borderRight: `1px solid ${sidebarBorder}` })
        }}
      >
        <div className="space-y-3">
          <div 
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: sidebarText || 'hsl(var(--muted-foreground))' }}
          >
            Steps
          </div>
          {flow.steps.slice(0, 4).map((step, index) => (
            <div key={step.id} className="flex items-center gap-2 p-2 rounded-md bg-background/50">
              <div 
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  index === 0 ? '' : 'bg-muted text-muted-foreground'
                }`}
                style={index === 0 ? {
                  backgroundColor: accentColor || 'hsl(var(--primary))',
                  color: 'white'
                } : {}}
              >
                {index + 1}
              </div>
              <span className="text-xs truncate">{step.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const NavigationPreview = () => (
    <div className="p-3 bg-muted/5">
      <div className="flex items-center gap-2 text-xs">
        <Badge 
          variant="outline" 
          className="text-xs"
          style={{
            ...(accentColor && { 
              borderColor: accentColor,
              color: accentColor 
            })
          }}
        >
          {flow.name}
        </Badge>
        <span className="text-muted-foreground">•</span>
        <span className="text-muted-foreground">Step 1 of {flow.steps.length}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Device Mode Selector */}
      <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
        <span className="text-sm font-medium">Preview:</span>
        <div className="flex gap-1">
          <Button
            variant={deviceMode === 'desktop' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onDeviceModeChange?.('desktop')}
          >
            <Monitor className="w-4 h-4" />
          </Button>
          <Button
            variant={deviceMode === 'tablet' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onDeviceModeChange?.('tablet')}
          >
            <Tablet className="w-4 h-4" />
          </Button>
          <Button
            variant={deviceMode === 'mobile' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onDeviceModeChange?.('mobile')}
          >
            <Smartphone className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex justify-center">
        <div className={`${getDeviceWidth()} transition-all duration-300`}>
          {useCustomLayout && layoutAreas.length > 0 ? (
            /* Custom Layout Preview */
            <Card className="overflow-hidden h-96">
              <LayoutEngine
                areas={layoutAreas}
                children={{
                  sidebar: <SidebarPreview />,
                  main: <MainContentPreview />,
                  header: <HeaderPreview />,
                  footer: <FooterPreview />,
                  navigation: <NavigationPreview />
                }}
                uiConfig={{
                  accentColor,
                  primaryColor,
                  sidebarBackground: flow.uiConfig?.sidebarBackground,
                  sidebarBorder: flow.uiConfig?.sidebarBorder,
                  mainBackground: flow.uiConfig?.mainBackground,
                  mainBorderRadius: flow.uiConfig?.mainBorderRadius
                }}
                className="h-full"
              />
            </Card>
          ) : (
            /* Traditional Layout Preview */
            <Card className="overflow-hidden">
              <HeaderPreview />
              <MainContentPreview />
              <FooterPreview />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};