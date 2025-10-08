import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Alert, AlertDescription } from './ui/alert';
import { 
  BookOpen, Info, Plus, Trash2, Target, Star, Lightbulb, 
  CheckCircle, AlertTriangle, Tags, Clock, Shield 
} from 'lucide-react';
import { Flow, FlowStep } from '../types/flow';

interface CustomInfoAreaConfigProps {
  flow: Flow;
  selectedStep?: FlowStep;
  onUpdateFlow: (updates: Partial<Flow>) => void;
  onUpdateStep: (stepId: string, updates: Partial<FlowStep>) => void;
}

export const CustomInfoAreaConfig: React.FC<CustomInfoAreaConfigProps> = ({
  flow,
  selectedStep,
  onUpdateFlow,
  onUpdateStep
}) => {
  // Helper to get current custom info config
  const getFlowCustomInfo = () => flow.customInfo || {};
  const getStepCustomInfo = () => selectedStep?.customInfo || {};

  // Update flow-level custom info
  const updateFlowCustomInfo = (updates: any) => {
    onUpdateFlow({
      customInfo: {
        ...getFlowCustomInfo(),
        ...updates
      }
    });
  };

  // Update step-level custom info
  const updateStepCustomInfo = (updates: any) => {
    if (!selectedStep) return;
    
    onUpdateStep(selectedStep.id, {
      customInfo: {
        ...getStepCustomInfo(),
        ...updates
      }
    });
  };

  // Helper to add/remove items from arrays
  const updateArrayField = (
    type: 'flow' | 'step', 
    field: string, 
    value: string, 
    action: 'add' | 'remove',
    index?: number
  ) => {
    const currentConfig = type === 'flow' ? getFlowCustomInfo() : getStepCustomInfo();
    const currentArray = currentConfig[field] || [];
    
    let newArray;
    if (action === 'add') {
      newArray = [...currentArray, value];
    } else if (action === 'remove' && index !== undefined) {
      newArray = currentArray.filter((_: any, i: number) => i !== index);
    } else {
      return;
    }

    if (type === 'flow') {
      updateFlowCustomInfo({ [field]: newArray });
    } else {
      updateStepCustomInfo({ [field]: newArray });
    }
  };

  const ArrayEditor = ({ 
    title, 
    icon: Icon, 
    field, 
    type, 
    placeholder, 
    description 
  }: {
    title: string;
    icon: any;
    field: string;
    type: 'flow' | 'step';
    placeholder: string;
    description: string;
  }) => {
    const [newItem, setNewItem] = React.useState('');
    const currentConfig = type === 'flow' ? getFlowCustomInfo() : getStepCustomInfo();
    const items = currentConfig[field] || [];

    const addItem = () => {
      if (newItem.trim()) {
        updateArrayField(type, field, newItem.trim(), 'add');
        setNewItem('');
      }
    };

    const removeItem = (index: number) => {
      updateArrayField(type, field, '', 'remove', index);
    };

    return (
      <Card className="border-l-4 border-l-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">{title}</CardTitle>
          </div>
          <CardDescription className="text-xs">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length > 0 && (
            <div className="space-y-2">
              {items.map((item: string, index: number) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-muted/30 rounded">
                  <span className="text-sm flex-1">{item}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex gap-2">
            <Input
              placeholder={placeholder}
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
              className="text-sm"
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addItem}
              disabled={!newItem.trim()}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Custom Information Area</h3>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          The Custom Information Area provides contextual help and guidance to users. 
          Configure it at the flow level for global settings, or override at the step level for specific guidance.
        </AlertDescription>
      </Alert>

      {/* Flow-Level Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Flow-Level Configuration
          </CardTitle>
          <CardDescription>
            Global settings that apply to all steps unless overridden
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Enable Custom Info Area</Label>
              <p className="text-xs text-muted-foreground">
                Global toggle for the custom information area
              </p>
            </div>
            <Switch
              checked={getFlowCustomInfo().enabled !== false}
              onCheckedChange={(checked) => updateFlowCustomInfo({ enabled: checked })}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm">Estimated Duration</Label>
              <Input
                placeholder="e.g., 5-10 minutes"
                value={getFlowCustomInfo().estimatedDuration || ''}
                onChange={(e) => updateFlowCustomInfo({ estimatedDuration: e.target.value })}
                className="text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">Difficulty Level</Label>
              <select
                value={getFlowCustomInfo().difficulty || 'medium'}
                onChange={(e) => updateFlowCustomInfo({ difficulty: e.target.value })}
                className="w-full px-3 py-2 text-sm border rounded-md"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Tags</Label>
            <div className="flex flex-wrap gap-1 min-h-[32px] p-2 border rounded-md">
              {(getFlowCustomInfo().tags || []).map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateArrayField('flow', 'tags', '', 'remove', index)}
                    className="h-4 w-4 p-0 ml-1 hover:bg-destructive/20"
                  >
                    ×
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                className="text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const value = (e.target as HTMLInputElement).value.trim();
                    if (value) {
                      updateArrayField('flow', 'tags', value, 'add');
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flow-Level Content Arrays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ArrayEditor
          title="Flow Objectives"
          icon={Target}
          field="objectives"
          type="flow"
          placeholder="Add objective..."
          description="Main goals users should achieve"
        />

        <ArrayEditor
          title="Key Points"
          icon={Star}
          field="keyPoints"
          type="flow"
          placeholder="Add key point..."
          description="Important information to highlight"
        />

        <ArrayEditor
          title="Best Practices"
          icon={CheckCircle}
          field="bestPractices"
          type="flow"
          placeholder="Add best practice..."
          description="Recommended approaches"
        />

        <ArrayEditor
          title="Prerequisites"
          icon={Clock}
          field="prerequisites"
          type="flow"
          placeholder="Add prerequisite..."
          description="Requirements before starting"
        />
      </div>

      {/* Step-Level Configuration */}
      {selectedStep && (
        <>
          <Separator className="my-6" />
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Step-Level Configuration: {selectedStep.name}
              </CardTitle>
              <CardDescription>
                Override flow settings for this specific step
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Override Flow Settings</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable custom info for this step regardless of flow setting
                  </p>
                </div>
                <Switch
                  checked={getStepCustomInfo().enabled === true}
                  onCheckedChange={(checked) => updateStepCustomInfo({ enabled: checked })}
                />
              </div>

              {getStepCustomInfo().enabled && (
                <>
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-sm">Step Difficulty</Label>
                      <select
                        value={getStepCustomInfo().difficulty || 'medium'}
                        onChange={(e) => updateStepCustomInfo({ difficulty: e.target.value })}
                        className="w-full px-3 py-2 text-sm border rounded-md"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  {/* Step-Level Content Arrays */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                    <ArrayEditor
                      title="Step Objectives"
                      icon={Target}
                      field="objectives"
                      type="step"
                      placeholder="Add step objective..."
                      description="Goals for this specific step"
                    />

                    <ArrayEditor
                      title="Examples"
                      icon={Lightbulb}
                      field="examples"
                      type="step"
                      placeholder="Add example..."
                      description="Concrete examples for this step"
                    />

                    <ArrayEditor
                      title="Common Mistakes"
                      icon={AlertTriangle}
                      field="commonMistakes"
                      type="step"
                      placeholder="Add common mistake..."
                      description="Things users often get wrong"
                    />

                    <ArrayEditor
                      title="Step Tags"
                      icon={Tags}
                      field="tags"
                      type="step"
                      placeholder="Add tag..."
                      description="Tags specific to this step"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Preview Section */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4" />
            Configuration Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Flow-level:</strong> {getFlowCustomInfo().enabled !== false ? 'Enabled' : 'Disabled'}
              {getFlowCustomInfo().enabled !== false && (
                <span className="text-muted-foreground ml-2">
                  ({(getFlowCustomInfo().objectives || []).length} objectives, 
                  {(getFlowCustomInfo().keyPoints || []).length} key points)
                </span>
              )}
            </div>
            
            {selectedStep && (
              <div>
                <strong>Step "{selectedStep.name}":</strong> {
                  getStepCustomInfo().enabled === true ? 'Override Enabled' :
                  getStepCustomInfo().enabled === false ? 'Explicitly Disabled' : 'Inherits Flow Setting'
                }
                {getStepCustomInfo().enabled === true && (
                  <span className="text-muted-foreground ml-2">
                    ({(getStepCustomInfo().objectives || []).length} objectives, 
                    {(getStepCustomInfo().examples || []).length} examples)
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};