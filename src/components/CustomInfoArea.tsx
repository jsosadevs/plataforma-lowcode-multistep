import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  BookOpen, Target, Star, Zap, Lightbulb, CheckCircle, AlertTriangle, 
  Edit3, X, HelpCircle, MessageSquare, CheckSquare, Layers, Database,
  Clock, Info, Settings
} from 'lucide-react';
import { FlowStep, Flow, FormField } from '../types/flow';

interface CustomInfoAreaProps {
  step: FlowStep;
  flow?: Flow;
  selectedFieldForInfo: string | null;
  infoAreaMode: 'step' | 'inputs' | 'auto';
  enableDesignMode?: boolean;
  onInfoAreaModeChange: (mode: 'step' | 'inputs' | 'auto') => void;
  onSelectedFieldChange: (fieldKey: string | null) => void;
}

export const CustomInfoArea: React.FC<CustomInfoAreaProps> = ({
  step,
  flow,
  selectedFieldForInfo,
  infoAreaMode,
  enableDesignMode = false,
  onInfoAreaModeChange,
  onSelectedFieldChange
}) => {
  // Get custom info configuration from step or flow metadata
  const customInfoConfig = step.customInfo || flow?.customInfo || {};
  const enableCustomInfo = customInfoConfig.enabled !== false;
  
  if (!enableCustomInfo) return null;

  // Determine what information to show based on mode and context
  const shouldShowStepInfo = infoAreaMode === 'step' || (infoAreaMode === 'auto' && !selectedFieldForInfo);
  const shouldShowInputInfo = infoAreaMode === 'inputs' || (infoAreaMode === 'auto' && selectedFieldForInfo);
  
  // Get the selected field if any
  const selectedField = selectedFieldForInfo ? step.formFields.find(f => f.key === selectedFieldForInfo) : null;

  // Enhanced step-focused information with fallbacks
  const stepInfo = {
    objectives: customInfoConfig.objectives || [],
    keyPoints: customInfoConfig.keyPoints || [],
    examples: customInfoConfig.examples || [],
    bestPractices: customInfoConfig.bestPractices || [],
    commonMistakes: customInfoConfig.commonMistakes || [],
    relatedSteps: customInfoConfig.relatedSteps || [],
    // Enhanced information
    tags: customInfoConfig.tags || [],
    estimatedDuration: customInfoConfig.estimatedTime || customInfoConfig.estimatedDuration,
    difficulty: customInfoConfig.difficulty || 'medium',
    prerequisites: customInfoConfig.prerequisites || []
  };

  // Enhanced input-focused information with auto-generated content
  const inputInfo = selectedField ? {
    purpose: selectedField.purpose || selectedField.helpText,
    validation: selectedField.validationRules || (selectedField.validation ? Object.entries(selectedField.validation).map(([key, value]) => `${key}: ${value}`) : []),
    examples: selectedField.examples || [],
    relatedFields: step.formFields.filter(f => 
      f.dependencyKey === selectedField.key || selectedField.dependencyKey === f.key
    ),
    formatting: selectedField.formatting || null,
    dataSource: selectedField.queryName || null,
    // Auto-generated information based on field type
    autoInfo: {
      type: selectedField.type,
      required: selectedField.required,
      hasOptions: !!selectedField.options || !!selectedField.queryName,
      isDynamic: !!selectedField.queryName,
      hasDependencies: !!selectedField.dependencyKey,
      placeholder: selectedField.placeholder
    }
  } : null;

  const InfoSection = ({ title, icon: Icon, children, variant = 'default' }: {
    title: string;
    icon: any;
    children: React.ReactNode;
    variant?: 'default' | 'primary' | 'success' | 'warning';
  }) => {
    const colors = {
      default: 'border-l-muted-foreground bg-muted/30 text-muted-foreground',
      primary: 'border-l-primary bg-primary/5 text-primary',
      success: 'border-l-green-500 bg-green-50/50 text-green-600',
      warning: 'border-l-amber-500 bg-amber-50/50 text-amber-600'
    };

    return (
      <div className={`border-l-4 rounded-r-lg p-4 ${colors[variant]}`}>
        <div className="flex items-center gap-2 mb-3">
          <Icon className="h-4 w-4" />
          <h4 className="font-medium text-sm">{title}</h4>
        </div>
        {children}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Enhanced Mode Toggle with Status */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-muted/20 to-muted/10 rounded-lg border">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <div>
            <span className="text-sm font-medium">Contextual Information</span>
            {selectedFieldForInfo && (
              <div className="text-xs text-muted-foreground mt-0.5">
                Showing: {selectedField?.label || 'Field Info'}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Activity indicator */}
          {selectedFieldForInfo && (
            <div className="flex items-center gap-1 text-xs text-primary">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              Active
            </div>
          )}
          <Tabs value={infoAreaMode} onValueChange={(value) => onInfoAreaModeChange(value as typeof infoAreaMode)}>
            <TabsList className="h-8">
              <TabsTrigger value="auto" className="text-xs px-2">Auto</TabsTrigger>
              <TabsTrigger value="step" className="text-xs px-2">Step</TabsTrigger>
              <TabsTrigger value="inputs" className="text-xs px-2">Fields</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Enhanced Step Information */}
      {shouldShowStepInfo && (
        <div className="space-y-3">
          <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-transparent">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  <CardTitle className="text-sm">Step Overview</CardTitle>
                </div>
                {stepInfo.estimatedDuration && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {stepInfo.estimatedDuration}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick step stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 bg-muted/30 rounded">
                  <div className="text-lg font-semibold text-primary">{step.formFields.length}</div>
                  <div className="text-xs text-muted-foreground">Fields</div>
                </div>
                <div className="text-center p-2 bg-muted/30 rounded">
                  <div className="text-lg font-semibold text-primary">
                    {stepInfo.difficulty === 'easy' ? '🟢' : stepInfo.difficulty === 'hard' ? '🔴' : '🟡'}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">{stepInfo.difficulty}</div>
                </div>
              </div>

              {stepInfo.prerequisites.length > 0 && (
                <InfoSection title="Prerequisites" icon={CheckSquare} variant="warning">
                  <ul className="text-sm space-y-1">
                    {stepInfo.prerequisites.map((prereq, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                        {prereq}
                      </li>
                    ))}
                  </ul>
                </InfoSection>
              )}

              {stepInfo.objectives.length > 0 && (
                <InfoSection title="Objectives" icon={Star} variant="primary">
                  <ul className="text-sm space-y-1">
                    {stepInfo.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckSquare className="h-3 w-3 mt-1 flex-shrink-0" />
                        {objective}
                      </li>
                    ))}
                  </ul>
                </InfoSection>
              )}

              {stepInfo.keyPoints.length > 0 && (
                <InfoSection title="Key Points" icon={Zap} variant="success">
                  <ul className="text-sm space-y-1">
                    {stepInfo.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </InfoSection>
              )}

              {stepInfo.examples.length > 0 && (
                <InfoSection title="Examples" icon={Lightbulb}>
                  <div className="space-y-2">
                    {stepInfo.examples.map((example, index) => (
                      <div key={index} className="p-2 bg-muted/50 rounded text-sm">
                        {example}
                      </div>
                    ))}
                  </div>
                </InfoSection>
              )}

              {stepInfo.bestPractices.length > 0 && (
                <InfoSection title="Best Practices" icon={CheckCircle} variant="success">
                  <ul className="text-sm space-y-1">
                    {stepInfo.bestPractices.map((practice, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        {practice}
                      </li>
                    ))}
                  </ul>
                </InfoSection>
              )}

              {stepInfo.commonMistakes.length > 0 && (
                <InfoSection title="Common Mistakes to Avoid" icon={AlertTriangle} variant="warning">
                  <ul className="text-sm space-y-1">
                    {stepInfo.commonMistakes.map((mistake, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="h-3 w-3 mt-1 flex-shrink-0" />
                        {mistake}
                      </li>
                    ))}
                  </ul>
                </InfoSection>
              )}

              {stepInfo.tags.length > 0 && (
                <div className="pt-2 border-t">
                  <div className="flex flex-wrap gap-1">
                    {stepInfo.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Field Selection for Input Mode */}
      {infoAreaMode === 'inputs' && !selectedFieldForInfo && step.formFields.length > 0 && (
        <Card className="border-dashed">
          <CardContent className="p-4">
            <div className="text-center text-muted-foreground">
              <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm mb-3">Select a field to view detailed information</p>
              <div className="grid grid-cols-1 gap-2">
                {step.formFields.map(field => (
                  <Button
                    key={field.key}
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectedFieldChange(field.key)}
                    className="justify-start"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                        {field.type}
                      </span>
                      {field.label}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Input Information */}
      {shouldShowInputInfo && selectedField && inputInfo && (
        <div className="space-y-3">
          <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50/50 to-transparent">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit3 className="h-4 w-4 text-purple-500" />
                  <div>
                    <CardTitle className="text-sm">Field: {selectedField.label}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {inputInfo.autoInfo.type}
                      </Badge>
                      {inputInfo.autoInfo.required && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                      {inputInfo.autoInfo.isDynamic && (
                        <Badge variant="secondary" className="text-xs">Dynamic</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onSelectedFieldChange(null)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Auto-generated field information */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-muted/20 rounded-lg">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Type</div>
                  <div className="font-medium text-sm capitalize">{inputInfo.autoInfo.type}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Status</div>
                  <div className="font-medium text-sm">
                    {inputInfo.autoInfo.required ? '🔴 Required' : '⚪ Optional'}
                  </div>
                </div>
              </div>

              {inputInfo.purpose && (
                <InfoSection title="Purpose" icon={Target} variant="primary">
                  <p className="text-sm">{inputInfo.purpose}</p>
                </InfoSection>
              )}

              {inputInfo.autoInfo.placeholder && (
                <InfoSection title="Placeholder Text" icon={MessageSquare}>
                  <p className="text-sm italic text-muted-foreground">"{inputInfo.autoInfo.placeholder}"</p>
                </InfoSection>
              )}

              {/* Auto-generated field type guidance */}
              {!inputInfo.purpose && (
                <InfoSection title="Field Guidance" icon={HelpCircle}>
                  <div className="text-sm text-muted-foreground">
                    {inputInfo.autoInfo.type === 'email' && (
                      <p>Enter a valid email address (e.g., user@domain.com)</p>
                    )}
                    {inputInfo.autoInfo.type === 'password' && (
                      <p>Enter a secure password. Consider using a mix of letters, numbers, and symbols.</p>
                    )}
                    {inputInfo.autoInfo.type === 'number' && (
                      <p>Enter a numeric value. Use only digits and decimal points if needed.</p>
                    )}
                    {inputInfo.autoInfo.type === 'date' && (
                      <p>Select a date from the calendar picker or enter in the format shown.</p>
                    )}
                    {inputInfo.autoInfo.type === 'select' && (
                      <p>Choose one option from the dropdown list. Options may update based on other selections.</p>
                    )}
                    {inputInfo.autoInfo.type === 'textarea' && (
                      <p>Enter multiple lines of text. You can use line breaks and longer descriptions.</p>
                    )}
                    {inputInfo.autoInfo.type === 'text' && (
                      <p>Enter text information. This is a general text input field.</p>
                    )}
                  </div>
                </InfoSection>
              )}

              {inputInfo.examples.length > 0 && (
                <InfoSection title="Examples" icon={Lightbulb}>
                  <div className="space-y-2">
                    {inputInfo.examples.map((example, index) => (
                      <div key={index} className="p-2 bg-muted/50 rounded text-sm font-mono">
                        {example}
                      </div>
                    ))}
                  </div>
                </InfoSection>
              )}

              {inputInfo.formatting && (
                <InfoSection title="Format Requirements" icon={MessageSquare}>
                  <p className="text-sm font-mono bg-muted/50 p-2 rounded">{inputInfo.formatting}</p>
                </InfoSection>
              )}

              {inputInfo.validation.length > 0 && (
                <InfoSection title="Validation Rules" icon={CheckSquare} variant="warning">
                  <ul className="text-sm space-y-1">
                    {inputInfo.validation.map((rule, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckSquare className="h-3 w-3 mt-1 flex-shrink-0" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </InfoSection>
              )}

              {inputInfo.autoInfo.hasDependencies && (
                <InfoSection title="Dependencies" icon={Layers} variant="warning">
                  <p className="text-sm">
                    This field depends on: <strong>{selectedField.dependencyKey}</strong>
                    <br />
                    <span className="text-muted-foreground text-xs">
                      Select the dependency field first to enable this option.
                    </span>
                  </p>
                </InfoSection>
              )}

              {inputInfo.relatedFields.length > 0 && (
                <InfoSection title="Related Fields" icon={Layers}>
                  <div className="flex flex-wrap gap-2">
                    {inputInfo.relatedFields.map(field => (
                      <Badge 
                        key={field.key} 
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10 transition-colors"
                        onClick={() => onSelectedFieldChange(field.key)}
                      >
                        {field.label}
                      </Badge>
                    ))}
                  </div>
                </InfoSection>
              )}

              {inputInfo.dataSource && (
                <InfoSection title="Data Source" icon={Database}>
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="font-medium">Query:</span>
                      <code className="ml-2 bg-muted/50 px-2 py-1 rounded text-xs">{inputInfo.dataSource}</code>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Options are loaded dynamically from the configured data source.
                    </div>
                  </div>
                </InfoSection>
              )}

              {/* Smart suggestions based on field context */}
              {!inputInfo.purpose && !inputInfo.examples.length && (
                <InfoSection title="Smart Tips" icon={Lightbulb} variant="success">
                  <div className="text-sm space-y-1">
                    {inputInfo.autoInfo.required && (
                      <p>• This field is required - you must fill it before continuing</p>
                    )}
                    {inputInfo.autoInfo.hasOptions && (
                      <p>• This field has predefined options to choose from</p>
                    )}
                    {inputInfo.autoInfo.isDynamic && (
                      <p>• Options in this field change based on other selections</p>
                    )}
                  </div>
                </InfoSection>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Quick actions for contextual help */}
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>Need more help with this {shouldShowInputInfo ? 'field' : 'step'}?</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              <HelpCircle className="h-3 w-3 mr-1" />
              Support
            </Button>
            {enableDesignMode && (
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                <Settings className="h-3 w-3 mr-1" />
                Edit Info
              </Button>
            )}
          </div>
        </div>
        
        {/* Contextual actions based on current mode */}
        {shouldShowInputInfo && selectedField && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 text-xs flex-1"
              onClick={() => {
                // Copy field name or example to clipboard
                navigator.clipboard.writeText(selectedField.label);
              }}
            >
              <span className="mr-1">📋</span>
              Copy Field Name
            </Button>
            {step.formFields.length > 1 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs flex-1"
                onClick={() => {
                  // Navigate to next field
                  const currentIndex = step.formFields.findIndex(f => f.key === selectedField.key);
                  const nextField = step.formFields[currentIndex + 1] || step.formFields[0];
                  onSelectedFieldChange(nextField.key);
                }}
              >
                <span className="mr-1">➡️</span>
                Next Field
              </Button>
            )}
          </div>
        )}
        
        {shouldShowStepInfo && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 text-xs flex-1"
              onClick={() => onInfoAreaModeChange('inputs')}
            >
              <span className="mr-1">🔍</span>
              View Field Info
            </Button>
            {stepInfo.estimatedDuration && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs flex-1"
                disabled
              >
                <Clock className="h-3 w-3 mr-1" />
                {stepInfo.estimatedDuration}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};