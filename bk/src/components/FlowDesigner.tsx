import React, { useState } from 'react';
import { Flow, FlowStep, FormField, CustomQuery } from '../types/flow';
import { useFlowService } from '../hooks/useFlowService';
import { useQueryManager } from '../hooks/useQueryManager';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  GripVertical,
  Settings,
  Save,
  Eye,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ActionButtons, useCommonActions } from './ActionButtons';

interface FlowDesignerProps {
  onPreviewFlow?: (flowId: string) => void;
}

export const FlowDesigner: React.FC<FlowDesignerProps> = ({ onPreviewFlow }) => {
  const { flows, addFlow, updateFlow, deleteFlow, duplicateFlow } = useFlowService();
  const { queries } = useQueryManager();
  const { createPreviewAction, createDuplicateAction, createDeleteAction, createEditAction } = useCommonActions();
  
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
  const [editingStep, setEditingStep] = useState<FlowStep | null>(null);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [isNewFlow, setIsNewFlow] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  
  // Form states
  const [flowForm, setFlowForm] = useState<Partial<Flow>>({});
  const [stepForm, setStepForm] = useState<Partial<FlowStep>>({});
  const [fieldForm, setFieldForm] = useState<Partial<FormField>>({});

  const resetForms = () => {
    setFlowForm({});
    setStepForm({});
    setFieldForm({});
    setEditingStep(null);
    setEditingField(null);
  };

  const handleNewFlow = () => {
    setSelectedFlow(null);
    setIsNewFlow(true);
    setFlowForm({
      name: '',
      description: '',
      steps: []
    });
    resetForms();
  };

  const handleSelectFlow = (flow: Flow) => {
    setSelectedFlow(flow);
    setIsNewFlow(false);
    setFlowForm(flow);
    resetForms();
  };

  const handleSaveFlow = () => {
    if (!flowForm.name) {
      toast.error('Flow name is required');
      return;
    }

    const flowData: Flow = {
      id: selectedFlow?.id || `flow-${Date.now()}`,
      name: flowForm.name,
      description: flowForm.description || '',
      steps: flowForm.steps || [],
      created: selectedFlow?.created || new Date(),
      updated: new Date()
    };

    if (isNewFlow) {
      addFlow(flowData);
      toast.success('Flow created successfully');
    } else {
      updateFlow(flowData.id, flowData);
      toast.success('Flow updated successfully');
    }

    setSelectedFlow(flowData);
    setIsNewFlow(false);
  };

  const handleDeleteFlow = (flowId: string) => {
    deleteFlow(flowId);
    if (selectedFlow?.id === flowId) {
      setSelectedFlow(null);
      setIsNewFlow(false);
      resetForms();
    }
    toast.success('Flow deleted successfully');
  };

  const handleDuplicateFlow = (flowId: string) => {
    const duplicated = duplicateFlow(flowId);
    if (duplicated) {
      toast.success('Flow duplicated successfully');
      handleSelectFlow(duplicated);
    }
  };

  const handleAddStep = () => {
    const newStep: FlowStep = {
      id: `step-${Date.now()}`,
      name: 'New Step',
      formFields: []
    };
    
    const updatedSteps = [...(flowForm.steps || []), newStep];
    setFlowForm({ ...flowForm, steps: updatedSteps });
  };

  const handleEditStep = (step: FlowStep) => {
    setEditingStep(step);
    setStepForm(step);
  };

  const handleSaveStep = () => {
    if (!stepForm.name) {
      toast.error('Step name is required');
      return;
    }

    const updatedStep: FlowStep = {
      ...editingStep!,
      ...stepForm
    };

    const updatedSteps = flowForm.steps?.map(step => 
      step.id === editingStep!.id ? updatedStep : step
    ) || [];

    setFlowForm({ ...flowForm, steps: updatedSteps });
    setEditingStep(null);
    setStepForm({});
    toast.success('Step updated successfully');
  };

  const handleDeleteStep = (stepId: string) => {
    const updatedSteps = flowForm.steps?.filter(step => step.id !== stepId) || [];
    setFlowForm({ ...flowForm, steps: updatedSteps });
    toast.success('Step deleted successfully');
  };

  const handleAddField = (stepId: string) => {
    const newField: FormField = {
      key: `field-${Date.now()}`,
      label: 'New Field',
      type: 'text'
    };

    const updatedSteps = flowForm.steps?.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          formFields: [...step.formFields, newField]
        };
      }
      return step;
    }) || [];

    setFlowForm({ ...flowForm, steps: updatedSteps });
  };

  const handleEditField = (stepId: string, field: FormField) => {
    setEditingField(field);
    setFieldForm(field);
  };

  const handleSaveField = (stepId: string) => {
    if (!fieldForm.key || !fieldForm.label) {
      toast.error('Field key and label are required');
      return;
    }

    const updatedField: FormField = {
      ...editingField!,
      ...fieldForm
    };

    const updatedSteps = flowForm.steps?.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          formFields: step.formFields.map(field => 
            field.key === editingField!.key ? updatedField : field
          )
        };
      }
      return step;
    }) || [];

    setFlowForm({ ...flowForm, steps: updatedSteps });
    setEditingField(null);
    setFieldForm({});
    toast.success('Field updated successfully');
  };

  const handleDeleteField = (stepId: string, fieldKey: string) => {
    const updatedSteps = flowForm.steps?.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          formFields: step.formFields.filter(field => field.key !== fieldKey)
        };
      }
      return step;
    }) || [];

    setFlowForm({ ...flowForm, steps: updatedSteps });
    toast.success('Field deleted successfully');
  };

  const toggleStepExpanded = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const renderFlowList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3>Flows</h3>
        <Button onClick={handleNewFlow} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Flow
        </Button>
      </div>
      
      <div className="space-y-2">
        {flows.map(flow => (
          <Card 
            key={flow.id} 
            className={`cursor-pointer transition-colors ${
              selectedFlow?.id === flow.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleSelectFlow(flow)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-sm">{flow.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {flow.steps.length} steps
                  </CardDescription>
                </div>
                <ActionButtons
                  actions={[
                    createPreviewAction(() => {
                      if (onPreviewFlow) onPreviewFlow(flow.id);
                    }),
                    createDuplicateAction(() => handleDuplicateFlow(flow.id)),
                    createDeleteAction(() => handleDeleteFlow(flow.id))
                  ]}
                />
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderFlowEditor = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3>{isNewFlow ? 'New Flow' : 'Edit Flow'}</h3>
        <div className="flex space-x-2">
          {selectedFlow && onPreviewFlow && (
            <Button
              variant="outline"
              onClick={() => onPreviewFlow(selectedFlow.id)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          )}
          <Button onClick={handleSaveFlow}>
            <Save className="w-4 h-4 mr-2" />
            Save Flow
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="flow-name">Name</Label>
          <Input
            id="flow-name"
            value={flowForm.name || ''}
            onChange={(e) => setFlowForm({ ...flowForm, name: e.target.value })}
            placeholder="Enter flow name"
          />
        </div>

        <div>
          <Label htmlFor="flow-description">Description</Label>
          <Textarea
            id="flow-description"
            value={flowForm.description || ''}
            onChange={(e) => setFlowForm({ ...flowForm, description: e.target.value })}
            placeholder="Enter flow description"
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4>Steps</h4>
          <Button onClick={handleAddStep} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Step
          </Button>
        </div>

        {flowForm.steps?.map((step, index) => (
          <Card key={step.id}>
            <Collapsible 
              open={expandedSteps.has(step.id)}
              onOpenChange={() => toggleStepExpanded(step.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CollapsibleTrigger className="flex items-center space-x-2">
                    {expandedSteps.has(step.id) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <div className="text-left">
                      <CardTitle className="text-sm">
                        {index + 1}. {step.name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {step.formFields.length} fields
                      </CardDescription>
                    </div>
                  </CollapsibleTrigger>
                  
                  <ActionButtons
                    actions={[
                      createEditAction(() => handleEditStep(step)),
                      createDeleteAction(() => handleDeleteStep(step.id))
                    ]}
                    stopPropagation={false}
                  />
                </div>
              </CardHeader>

              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h5 className="text-sm font-medium">Form Fields</h5>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAddField(step.id)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Field
                      </Button>
                    </div>

                    {step.formFields.map((field) => (
                      <div key={field.key} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{field.label}</p>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {field.type}
                              </Badge>
                              {field.required && (
                                <Badge variant="destructive" className="text-xs">
                                  Required
                                </Badge>
                              )}
                              {field.queryName && (
                                <Badge variant="secondary" className="text-xs">
                                  Dynamic
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <ActionButtons
                          actions={[
                            createEditAction(() => handleEditField(step.id, field)),
                            createDeleteAction(() => handleDeleteField(step.id, field.key))
                          ]}
                          stopPropagation={false}
                        />
                      </div>
                    ))}

                    {step.formFields.length === 0 && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          No fields added yet. Click "Add Field" to get started.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}

        {(!flowForm.steps || flowForm.steps.length === 0) && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No steps added yet. Click "Add Step" to get started.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Flow List Panel */}
      <div className="col-span-3 border-r pr-6">
        {renderFlowList()}
      </div>

      {/* Flow Editor Panel */}
      <div className="col-span-9">
        {(selectedFlow || isNewFlow) ? renderFlowEditor() : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a flow to edit or create a new one</p>
            </div>
          </div>
        )}
      </div>

      {/* Step Editor Dialog */}
      <Dialog open={!!editingStep} onOpenChange={() => setEditingStep(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Step</DialogTitle>
            <DialogDescription>
              Configure the step settings and behavior
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="step-name">Name</Label>
              <Input
                id="step-name"
                value={stepForm.name || ''}
                onChange={(e) => setStepForm({ ...stepForm, name: e.target.value })}
                placeholder="Enter step name"
              />
            </div>

            <div>
              <Label htmlFor="step-description">Description</Label>
              <Textarea
                id="step-description"
                value={stepForm.description || ''}
                onChange={(e) => setStepForm({ ...stepForm, description: e.target.value })}
                placeholder="Enter step description"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingStep(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveStep}>
                Save Step
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Field Editor Dialog */}
      <Dialog open={!!editingField} onOpenChange={() => setEditingField(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Field</DialogTitle>
            <DialogDescription>
              Configure the field properties and validation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="field-key">Key</Label>
                <Input
                  id="field-key"
                  value={fieldForm.key || ''}
                  onChange={(e) => setFieldForm({ ...fieldForm, key: e.target.value })}
                  placeholder="field_key"
                />
              </div>
              <div>
                <Label htmlFor="field-label">Label</Label>
                <Input
                  id="field-label"
                  value={fieldForm.label || ''}
                  onChange={(e) => setFieldForm({ ...fieldForm, label: e.target.value })}
                  placeholder="Field Label"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="field-type">Type</Label>
              <Select
                value={fieldForm.type || 'text'}
                onValueChange={(value) => setFieldForm({ ...fieldForm, type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                  <SelectItem value="textarea">Textarea</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {fieldForm.type === 'select' && (
              <>
                <div>
                  <Label htmlFor="field-query">Query Name</Label>
                  <Select
                    value={fieldForm.queryName || ''}
                    onValueChange={(value) => setFieldForm({ ...fieldForm, queryName: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a query" />
                    </SelectTrigger>
                    <SelectContent>
                      {queries.filter(q => q.isCatalog).map(query => (
                        <SelectItem key={query.name} value={query.name}>
                          {query.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="field-dependency">Dependency Field</Label>
                  <Input
                    id="field-dependency"
                    value={fieldForm.dependencyKey || ''}
                    onChange={(e) => setFieldForm({ ...fieldForm, dependencyKey: e.target.value })}
                    placeholder="parent_field_key"
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="field-placeholder">Placeholder</Label>
              <Input
                id="field-placeholder"
                value={fieldForm.placeholder || ''}
                onChange={(e) => setFieldForm({ ...fieldForm, placeholder: e.target.value })}
                placeholder="Enter placeholder text"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="field-required"
                checked={fieldForm.required || false}
                onChange={(e) => setFieldForm({ ...fieldForm, required: e.target.checked })}
              />
              <Label htmlFor="field-required">Required</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingField(null)}>
                Cancel
              </Button>
              <Button onClick={() => handleSaveField(editingStep?.id || '')}>
                Save Field
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};