import React, { useState, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Flow, FlowStep, FormField, CustomQuery, QueryChainAction } from '../types/flow';
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
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './ui/resizable';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './ui/breadcrumb';
import { 
  Plus, 
  Trash2, 
  Edit, 
  ChevronDown, 
  ChevronRight, 
  GripVertical,
  Settings,
  Eye,
  Lock,
  Unlock,
  AlertCircle,
  FolderPlus,
  Workflow,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  PanelTopClose,
  PanelTopOpen
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ActionButtons, useCommonActions } from './ActionButtons';
import { FormActionButtons } from './FormActionButtons';

interface FlowDesignerDnDProps {
  onPreviewFlow?: (flowId: string) => void;
}

const ItemTypes = {
  STEP: 'step',
  FIELD: 'field',
};

// Draggable Step Component
interface DraggableStepProps {
  step: FlowStep;
  index: number;
  flowId: string;
  isLocked: boolean;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddField: () => void;
  onEditField: (field: FormField) => void;
  onDeleteField: (fieldKey: string) => void;
  onMoveStep: (fromIndex: number, toIndex: number) => void;
  onMoveField: (stepId: string, fromIndex: number, toIndex: number) => void;
}

const DraggableStep: React.FC<DraggableStepProps> = ({
  step,
  index,
  flowId,
  isLocked,
  isExpanded,
  onToggleExpanded,
  onEdit,
  onDelete,
  onAddField,
  onEditField,
  onDeleteField,
  onMoveStep,
  onMoveField
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.STEP,
    item: { index },
    canDrag: !isLocked,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.STEP,
    hover: (item: { index: number }) => {
      if (!ref.current || isLocked) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      
      onMoveStep(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <Card 
      ref={ref} 
      style={{ 
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.2s ease'
      }}
      className={`border-l-4 hover:shadow-md transition-all ${
        isLocked 
          ? 'opacity-70 border-l-muted' 
          : 'border-l-primary hover:border-l-primary/80'
      }`}
    >
      <Collapsible open={isExpanded} onOpenChange={onToggleExpanded}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CollapsibleTrigger className="flex items-center gap-3 flex-1 min-w-0 group">
              <div className="flex items-center gap-2 flex-shrink-0">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform" />
                )}
                <GripVertical 
                  className={`w-4 h-4 transition-colors ${
                    isLocked 
                      ? 'text-muted-foreground/50 cursor-not-allowed' 
                      : 'text-muted-foreground group-hover:text-primary cursor-grab active:cursor-grabbing'
                  }`}
                />
              </div>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm text-primary">{index + 1}</span>
                </div>
                <div className="text-left min-w-0 flex-1">
                  <CardTitle className="text-sm truncate">
                    {step.name}
                  </CardTitle>
                  <CardDescription className="text-xs flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      {step.formFields.length} fields
                    </Badge>
                    {step.queryChain && step.queryChain.length > 0 && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">
                        {step.queryChain.length} queries
                      </Badge>
                    )}
                  </CardDescription>
                </div>
              </div>
            </CollapsibleTrigger>
            
            <div className="flex gap-1 flex-shrink-0">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={onEdit} 
                disabled={isLocked}
                className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={onDelete} 
                disabled={isLocked}
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary/50 rounded-full"></div>
                  <h5 className="text-sm">Form Fields</h5>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={onAddField} 
                  disabled={isLocked}
                  className="h-7 gap-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add Field
                </Button>
              </div>

              <div className="space-y-2">
                {step.formFields.map((field, fieldIndex) => (
                  <DraggableField
                    key={field.key}
                    field={field}
                    index={fieldIndex}
                    stepId={step.id}
                    isLocked={isLocked}
                    onEdit={() => onEditField(field)}
                    onDelete={() => onDeleteField(field.key)}
                    onMoveField={(fromIndex, toIndex) => onMoveField(step.id, fromIndex, toIndex)}
                  />
                ))}
              </div>

              {step.formFields.length === 0 && (
                <div className="rounded-lg border-2 border-dashed border-muted p-6 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No fields added yet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Click "Add Field" to get started
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

// Draggable Field Component
interface DraggableFieldProps {
  field: FormField;
  index: number;
  stepId: string;
  isLocked: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMoveField: (fromIndex: number, toIndex: number) => void;
}

const DraggableField: React.FC<DraggableFieldProps> = ({
  field,
  index,
  stepId,
  isLocked,
  onEdit,
  onDelete,
  onMoveField
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.FIELD,
    item: { index, stepId },
    canDrag: !isLocked,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.FIELD,
    hover: (item: { index: number; stepId: string }) => {
      if (!ref.current || isLocked || item.stepId !== stepId) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      
      onMoveField(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <div 
      ref={ref}
      style={{ 
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? 'rotate(2deg)' : 'rotate(0deg)',
        transition: 'all 0.2s ease'
      }}
      className={`group flex items-center justify-between p-3 border rounded-lg transition-all ${
        isLocked 
          ? 'opacity-70 bg-muted/30' 
          : 'hover:border-primary/50 hover:shadow-sm hover:bg-accent/50'
      }`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <GripVertical 
          className={`w-4 h-4 flex-shrink-0 transition-colors ${
            isLocked 
              ? 'text-muted-foreground/50 cursor-not-allowed' 
              : 'text-muted-foreground group-hover:text-primary cursor-grab active:cursor-grabbing'
          }`}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate">{field.label}</p>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <Badge variant="outline" className="text-xs px-1.5 py-0">
              {field.type}
            </Badge>
            {field.required && (
              <Badge variant="destructive" className="text-xs px-1.5 py-0">
                Required
              </Badge>
            )}
            {field.queryName && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                Dynamic
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex gap-1 flex-shrink-0 ml-2">
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={onEdit} 
          disabled={isLocked}
          className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit className="w-3.5 h-3.5" />
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={onDelete} 
          disabled={isLocked}
          className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

// Main Flow Designer Component with DnD
export const FlowDesignerDnD: React.FC<FlowDesignerDnDProps> = ({ onPreviewFlow }) => {
  const {
    flowGroups,
    createFlowGroup,
    createFlow,
    updateFlow,
    deleteFlow,
    toggleFlowLock,
    createStep,
    updateStep,
    addFormField,
    updateFormField,
    deleteFormField,
    reorderSteps,
    reorderFields,
  } = useFlowService();

  const { queries } = useQueryManager();

  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isCreatingFlow, setIsCreatingFlow] = useState(false);
  const [newFlowCategory, setNewFlowCategory] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  
  // Panel visibility states
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(true);
  const [isCenterPanelVisible, setIsCenterPanelVisible] = useState(true);
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(true);
  
  // Editing states
  const [editingFlow, setEditingFlow] = useState<Flow | null>(null);
  const [editingStep, setEditingStep] = useState<FlowStep | null>(null);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [editingFieldStepId, setEditingFieldStepId] = useState<string | null>(null);
  
  // Delete confirmation
  const [showDeleteFlowDialog, setShowDeleteFlowDialog] = useState(false);
  const [flowToDelete, setFlowToDelete] = useState<{ flow: Flow; category: string } | null>(null);
  
  // Form states
  const [groupForm, setGroupForm] = useState({ category: '' });
  const [flowForm, setFlowForm] = useState<Partial<Flow>>({});
  const [stepForm, setStepForm] = useState<Partial<FlowStep>>({});
  const [fieldForm, setFieldForm] = useState<Partial<FormField>>({});
  const [queryChainForm, setQueryChainForm] = useState<QueryChainAction[]>([]);

  const selectedFlow = flowGroups
    .flatMap(g => g.flows)
    .find(f => f.id === selectedFlowId) || null;

  const selectedStep = selectedFlow?.steps.find(s => s.id === selectedStepId) || null;

  const selectedGroup = flowGroups.find(g => g.flows.some(f => f.id === selectedFlowId));

  const catalogQueries = queries.filter(q => q.isCatalog);
  const finalQueries = queries.filter(q => !q.isCatalog);
  const availableQueries = queries;

  // Group Management
  const handleCreateGroup = () => {
    if (!groupForm.category) {
      toast.error('Group name is required');
      return;
    }
    if (createFlowGroup(groupForm.category)) {
      toast.success('Group created successfully');
      setGroupForm({ category: '' });
      setIsCreatingGroup(false);
    } else {
      toast.error('A group with this name already exists');
    }
  };

  const toggleGroupCollapse = (category: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Flow Management
  const handleSelectFlow = (flowId: string) => {
    setSelectedFlowId(flowId);
    setSelectedStepId(null);
    setEditingFlow(null);
    setEditingStep(null);
    setEditingField(null);
  };

  const handleCreateFlow = (category: string) => {
    setIsCreatingFlow(true);
    setNewFlowCategory(category);
    setEditingFlow({ id: '', name: '', description: '', steps: [], availableInCertificates: false } as Flow);
    setFlowForm({ name: '', description: '', availableInCertificates: false, steps: [] });
    setSelectedFlowId(null);
  };

  const handleEditFlow = (flow: Flow) => {
    if (flow.locked) {
      toast.error('Cannot edit a locked flow');
      return;
    }
    setEditingFlow(flow);
    setFlowForm(flow);
    setIsCreatingFlow(false);
  };

  const handleSaveFlow = () => {
    if (!flowForm.name) {
      toast.error('Flow name is required');
      return;
    }

    if (isCreatingFlow && newFlowCategory) {
      const newFlow: Flow = {
        id: flowForm.id || `flow-${Date.now()}`,
        name: flowForm.name,
        description: flowForm.description || '',
        steps: [],
        availableInCertificates: flowForm.availableInCertificates || false,
        created: new Date(),
        updated: new Date()
      };
      createFlow(newFlow, newFlowCategory);
      setSelectedFlowId(newFlow.id);
      toast.success('Flow created successfully');
    } else if (editingFlow) {
      const updatedFlow: Flow = {
        ...editingFlow,
        name: flowForm.name,
        description: flowForm.description || '',
        availableInCertificates: flowForm.availableInCertificates || false,
        updated: new Date()
      };
      updateFlow(updatedFlow);
      toast.success('Flow updated successfully');
    }

    setEditingFlow(null);
    setFlowForm({});
    setIsCreatingFlow(false);
    setNewFlowCategory(null);
  };

  const handleDeleteFlow = (flow: Flow, category: string) => {
    if (flow.locked) {
      toast.error('Cannot delete a locked flow');
      return;
    }
    setFlowToDelete({ flow, category });
    setShowDeleteFlowDialog(true);
  };

  const confirmDeleteFlow = () => {
    if (flowToDelete) {
      deleteFlow(flowToDelete.flow.id, flowToDelete.category);
      if (selectedFlowId === flowToDelete.flow.id) {
        setSelectedFlowId(null);
      }
      toast.success('Flow deleted successfully');
    }
    setShowDeleteFlowDialog(false);
    setFlowToDelete(null);
  };

  // Step Management
  const handleCreateStep = () => {
    if (!selectedFlowId || selectedFlow?.locked) return;
    setEditingStep({ id: '', name: '', description: '', formFields: [], queryChain: [] } as FlowStep);
    setStepForm({ name: '', description: '', queryChain: [] });
    setQueryChainForm([]);
  };

  const handleEditStep = (step: FlowStep) => {
    if (selectedFlow?.locked) return;
    setEditingStep(step);
    setStepForm(step);
    setQueryChainForm(step.queryChain || []);
  };

  const handleSaveStep = () => {
    if (!stepForm.name || !selectedFlowId) {
      toast.error('Step name is required');
      return;
    }

    const stepData: FlowStep = {
      id: editingStep?.id || `step-${Date.now()}`,
      name: stepForm.name,
      description: stepForm.description || '',
      formFields: editingStep?.formFields || [],
      queryChain: queryChainForm
    };

    if (editingStep?.id) {
      updateStep(selectedFlowId, stepData);
      toast.success('Step updated successfully');
    } else {
      createStep(selectedFlowId, stepData);
      toast.success('Step created successfully');
      setSelectedStepId(stepData.id);
    }

    setEditingStep(null);
    setStepForm({});
    setQueryChainForm([]);
  };

  const handleDeleteStep = (stepId: string) => {
    if (!selectedFlowId || selectedFlow?.locked) return;
    const updatedFlow = {
      ...selectedFlow!,
      steps: selectedFlow!.steps.filter(s => s.id !== stepId)
    };
    updateFlow(updatedFlow);
    toast.success('Step deleted successfully');
  };

  // Field Management
  const handleCreateField = (stepId: string) => {
    if (selectedFlow?.locked) return;
    setEditingField({ key: '', label: '', type: 'text', required: false } as FormField);
    setEditingFieldStepId(stepId);
    setFieldForm({ type: 'text', required: false });
  };

  const handleEditField = (stepId: string, field: FormField) => {
    if (selectedFlow?.locked) return;
    setEditingField(field);
    setEditingFieldStepId(stepId);
    setFieldForm(field);
  };

  const handleSaveField = () => {
    if (!fieldForm.key || !fieldForm.label || !selectedFlowId || !editingFieldStepId) {
      toast.error('Field key and label are required');
      return;
    }

    const fieldData: FormField = {
      key: fieldForm.key,
      label: fieldForm.label,
      type: fieldForm.type || 'text',
      required: fieldForm.required || false,
      queryName: fieldForm.queryName,
      dependencyKey: fieldForm.dependencyKey,
      placeholder: fieldForm.placeholder
    };

    if (editingField?.key) {
      updateFormField(selectedFlowId, editingFieldStepId, fieldData);
      toast.success('Field updated successfully');
    } else {
      addFormField(selectedFlowId, editingFieldStepId, fieldData);
      toast.success('Field created successfully');
    }

    setEditingField(null);
    setEditingFieldStepId(null);
    setFieldForm({});
  };

  const handleDeleteField = (stepId: string, fieldKey: string) => {
    if (!selectedFlowId || selectedFlow?.locked) return;
    deleteFormField(selectedFlowId, stepId, fieldKey);
    toast.success('Field deleted successfully');
  };

  // Query Chain Management
  const handleAddQueryChainAction = () => {
    setQueryChainForm([
      ...queryChainForm,
      { queryName: '', resultKey: '', parameters: {} }
    ]);
  };

  const handleUpdateQueryChainAction = (index: number, field: keyof QueryChainAction, value: any) => {
    const actions = [...queryChainForm];
    actions[index] = { ...actions[index], [field]: value };
    setQueryChainForm(actions);
  };

  const handleRemoveQueryChainAction = (index: number) => {
    const actions = [...queryChainForm];
    actions.splice(index, 1);
    setQueryChainForm(actions);
  };

  const toggleStepExpanded = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        {/* Header with title and controls */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <Workflow className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3>Flow Designer</h3>
                <p className="text-sm text-muted-foreground">
                  Visually design and configure your multi-step processes
                </p>
              </div>
            </div>

            {/* Breadcrumb Navigation */}
            {(selectedGroup || selectedFlow || selectedStep || editingStep) && (
              <Breadcrumb>
                <BreadcrumbList>
                  {selectedGroup && (
                    <>
                      <BreadcrumbItem>
                        <BreadcrumbLink
                          onClick={() => {
                            setSelectedFlowId(null);
                            setSelectedStepId(null);
                            setEditingStep(null);
                            setEditingField(null);
                          }}
                          className="cursor-pointer"
                        >
                          {selectedGroup.category}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      {selectedFlow && <BreadcrumbSeparator />}
                    </>
                  )}
                  
                  {selectedFlow && (
                    <>
                      <BreadcrumbItem>
                        <BreadcrumbLink
                          onClick={() => {
                            setSelectedStepId(null);
                            setEditingStep(null);
                            setEditingField(null);
                          }}
                          className="cursor-pointer"
                        >
                          {selectedFlow.name}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      {(selectedStep || editingStep) && <BreadcrumbSeparator />}
                    </>
                  )}
                  
                  {(selectedStep || editingStep) && (
                    <BreadcrumbItem>
                      <BreadcrumbPage>
                        {editingStep?.name || selectedStep?.name || 'New Step'}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            )}
          </div>

          {/* Control buttons */}
          <div className="flex gap-2">
            {/* Panel visibility controls */}
            <div className="flex gap-1 border rounded-md p-1">
              <Button
                size="sm"
                variant={isLeftPanelVisible ? "default" : "ghost"}
                onClick={() => setIsLeftPanelVisible(!isLeftPanelVisible)}
                className="h-7 w-7 p-0"
                title={isLeftPanelVisible ? "Hide Groups Panel" : "Show Groups Panel"}
              >
                {isLeftPanelVisible ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant={isCenterPanelVisible ? "default" : "ghost"}
                onClick={() => setIsCenterPanelVisible(!isCenterPanelVisible)}
                className="h-7 w-7 p-0"
                title={isCenterPanelVisible ? "Hide Steps Panel" : "Show Steps Panel"}
              >
                {isCenterPanelVisible ? <PanelTopClose className="w-4 h-4" /> : <PanelTopOpen className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant={isRightPanelVisible ? "default" : "ghost"}
                onClick={() => setIsRightPanelVisible(!isRightPanelVisible)}
                className="h-7 w-7 p-0"
                title={isRightPanelVisible ? "Hide Editor Panel" : "Show Editor Panel"}
              >
                {isRightPanelVisible ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
              </Button>
            </div>

            <Button 
              onClick={() => setIsCreatingGroup(true)}
              className="gap-2 shadow-sm hover:shadow-md transition-shadow"
            >
              <FolderPlus className="w-4 h-4" />
              New Group
            </Button>
          </div>
        </div>

        {/* Resizable panel layout */}
        <div className="h-[calc(100vh-200px)]">
          <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
            {/* Left Panel - Groups & Flows */}
            {isLeftPanelVisible && (
              <>
                <ResizablePanel 
                  defaultSize={
                    isCenterPanelVisible && isRightPanelVisible ? 25 :
                    isCenterPanelVisible || isRightPanelVisible ? 50 :
                    100
                  }
                  minSize={20} 
                  maxSize={isCenterPanelVisible && isRightPanelVisible ? 40 : 80}
                >
                  <div className="p-4 h-full overflow-auto space-y-4">
                    {isCreatingGroup && (
                      <Card className="border-primary/50 shadow-md">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <FolderPlus className="w-4 h-4 text-primary" />
                            New Group
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Input
                            value={groupForm.category}
                            onChange={(e) => setGroupForm({ category: e.target.value })}
                            placeholder="Enter group name"
                            className="focus:border-primary"
                            autoFocus
                          />
                          <FormActionButtons
                            onSave={handleCreateGroup}
                            onCancel={() => setIsCreatingGroup(false)}
                            saveLabel="Save"
                            size="sm"
                          />
                        </CardContent>
                      </Card>
                    )}

                    {flowGroups.map(group => (
                      <Card key={group.category} className="hover:shadow-sm transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-center gap-2">
                            <button
                              onClick={() => toggleGroupCollapse(group.category)}
                              className="flex items-center gap-2 flex-1 text-left group"
                            >
                              {collapsedGroups.has(group.category) ? (
                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                              )}
                              <CardTitle className="text-sm truncate">{group.category}</CardTitle>
                              <Badge variant="outline" className="text-xs px-1.5 py-0 flex-shrink-0">
                                {group.flows.length}
                              </Badge>
                            </button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCreateFlow(group.category)}
                              className="h-7 w-7 p-0 hover:bg-primary hover:text-primary-foreground"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        
                        {!collapsedGroups.has(group.category) && (
                          <CardContent className="pt-0 space-y-1.5">
                            {group.flows.map(flow => (
                              <button
                                key={flow.id}
                                onClick={() => handleSelectFlow(flow.id)}
                                className={`w-full text-left p-2.5 rounded-md transition-all ${
                                  selectedFlowId === flow.id
                                    ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-sm'
                                    : 'hover:bg-accent hover:shadow-sm'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    {flow.locked && <Lock className="w-3 h-3 flex-shrink-0 opacity-70" />}
                                    <span className="text-sm truncate">{flow.name}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    {flow.steps.length > 0 && (
                                      <Badge 
                                        variant={selectedFlowId === flow.id ? "secondary" : "outline"} 
                                        className="text-xs px-1.5 py-0"
                                      >
                                        {flow.steps.length}
                                      </Badge>
                                    )}
                                    {flow.availableInCertificates && (
                                      <Badge 
                                        variant={selectedFlowId === flow.id ? "secondary" : "outline"}
                                        className="text-xs px-1.5 py-0"
                                      >
                                        Published
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </button>
                            ))}
                            {group.flows.length === 0 && (
                              <div className="text-center py-4 rounded-lg border-2 border-dashed border-muted">
                                <p className="text-xs text-muted-foreground">No flows yet</p>
                              </div>
                            )}
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                </ResizablePanel>
                {(isCenterPanelVisible || isRightPanelVisible) && <ResizableHandle withHandle />}
              </>
            )}

            {/* Center Panel - Steps */}
            {isCenterPanelVisible && (
              <>
                <ResizablePanel 
                  defaultSize={
                    isLeftPanelVisible && isRightPanelVisible ? 50 : 
                    isLeftPanelVisible || isRightPanelVisible ? 75 : 
                    100
                  }
                  minSize={25}
                >
                  <div className="p-4 h-full overflow-auto space-y-4">

                {selectedFlow ? (
                  <>
                    <Card className="border-l-4 border-l-primary shadow-sm">
                  <CardHeader>
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                            <Workflow className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="truncate">{selectedFlow.name}</CardTitle>
                            <CardDescription className="line-clamp-2 mt-1">
                              {selectedFlow.description || 'No description provided'}
                            </CardDescription>
                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                              {selectedFlow.locked && (
                                <Badge variant="secondary" className="gap-1">
                                  <Lock className="w-3 h-3" />
                                  Locked
                                </Badge>
                              )}
                              <Badge variant="outline" className="gap-1">
                                <Settings className="w-3 h-3" />
                                {selectedFlow.steps.length} steps
                              </Badge>
                              {selectedFlow.availableInCertificates && (
                                <Badge variant="default" className="gap-1">
                                  <Eye className="w-3 h-3" />
                                  Published
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {onPreviewFlow && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onPreviewFlow(selectedFlow.id)}
                            className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground"
                            title="Preview Flow"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleFlowLock(selectedFlow.id)}
                          className="h-8 w-8 p-0 hover:bg-accent"
                          title={selectedFlow.locked ? 'Unlock Flow' : 'Lock Flow'}
                        >
                          {selectedFlow.locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleEditFlow(selectedFlow)}
                          disabled={selectedFlow.locked}
                          className="h-8 w-8 p-0"
                          variant="outline"
                          title="Edit Flow"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const group = flowGroups.find(g => g.flows.some(f => f.id === selectedFlow.id));
                            if (group) handleDeleteFlow(selectedFlow, group.category);
                          }}
                          disabled={selectedFlow.locked}
                          className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          title="Delete Flow"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-primary rounded-full"></div>
                    <h4>Steps</h4>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleCreateStep}
                    disabled={selectedFlow.locked}
                    className="gap-2 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Plus className="w-4 h-4" />
                    Add Step
                  </Button>
                </div>

                <div className="space-y-3">
                  {selectedFlow.steps.map((step, index) => (
                    <DraggableStep
                      key={step.id}
                      step={step}
                      index={index}
                      flowId={selectedFlow.id}
                      isLocked={selectedFlow.locked || false}
                      isExpanded={expandedSteps.has(step.id)}
                      onToggleExpanded={() => toggleStepExpanded(step.id)}
                      onEdit={() => handleEditStep(step)}
                      onDelete={() => handleDeleteStep(step.id)}
                      onAddField={() => handleCreateField(step.id)}
                      onEditField={(field) => handleEditField(step.id, field)}
                      onDeleteField={(fieldKey) => handleDeleteField(step.id, fieldKey)}
                      onMoveStep={(from, to) => reorderSteps(selectedFlow.id, from, to)}
                      onMoveField={(stepId, from, to) => reorderFields(selectedFlow.id, stepId, from, to)}
                    />
                  ))}
                  
                  {selectedFlow.steps.length === 0 && (
                    <div className="rounded-lg border-2 border-dashed border-muted p-12 text-center bg-muted/20">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                          <Settings className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm">No steps added yet</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Click "Add Step" above to build your workflow
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : isCreatingFlow && editingFlow ? (
              <Card className="border-primary/30 shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <Workflow className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>New Flow</CardTitle>
                      <CardDescription>Create a new flow in {newFlowCategory}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Flow ID</Label>
                    <Input
                      value={flowForm.id || ''}
                      onChange={(e) => setFlowForm({ ...flowForm, id: e.target.value })}
                      placeholder="unique-flow-id"
                      autoFocus
                    />
                  </div>
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={flowForm.name || ''}
                      onChange={(e) => setFlowForm({ ...flowForm, name: e.target.value })}
                      placeholder="Enter flow name"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={flowForm.description || ''}
                      onChange={(e) => setFlowForm({ ...flowForm, description: e.target.value })}
                      placeholder="Describe the purpose of this flow"
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                    <Switch
                      checked={flowForm.availableInCertificates || false}
                      onCheckedChange={(checked) => setFlowForm({ ...flowForm, availableInCertificates: checked })}
                    />
                    <div>
                      <Label className="cursor-pointer">Publish to Certificates Dashboard</Label>
                      <p className="text-xs text-muted-foreground">Make this flow available to end users</p>
                    </div>
                  </div>
                  <FormActionButtons
                    onSave={handleSaveFlow}
                    onCancel={() => {
                      setIsCreatingFlow(false);
                      setEditingFlow(null);
                      setFlowForm({});
                    }}
                    saveLabel="Save Flow"
                    className="pt-2"
                  />
                </CardContent>
              </Card>
            ) : editingFlow ? (
              <Card className="border-primary/30 shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <Edit className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Edit Flow</CardTitle>
                      <CardDescription>Update flow configuration</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={flowForm.name || ''}
                      onChange={(e) => setFlowForm({ ...flowForm, name: e.target.value })}
                      placeholder="Enter flow name"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={flowForm.description || ''}
                      onChange={(e) => setFlowForm({ ...flowForm, description: e.target.value })}
                      placeholder="Describe the purpose of this flow"
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                    <Switch
                      checked={flowForm.availableInCertificates || false}
                      onCheckedChange={(checked) => setFlowForm({ ...flowForm, availableInCertificates: checked })}
                    />
                    <div>
                      <Label className="cursor-pointer">Publish to Certificates Dashboard</Label>
                      <p className="text-xs text-muted-foreground">Make this flow available to end users</p>
                    </div>
                  </div>
                  <FormActionButtons
                    onSave={handleSaveFlow}
                    onCancel={() => {
                      setEditingFlow(null);
                      setFlowForm({});
                    }}
                    saveLabel="Save Changes"
                    className="pt-2"
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Workflow className="w-10 h-10 text-primary" />
                  </div>
                  <h4 className="text-foreground mb-2">No Flow Selected</h4>
                  <p className="text-sm">Select a flow from the list or create a new one to get started</p>
                </div>
              </div>
            )}
                  </div>
                </ResizablePanel>
              </>
            )}

            {/* Right Panel - Step/Field Editor */}
            {isRightPanelVisible && (
              <>
                {(isCenterPanelVisible || isLeftPanelVisible) && <ResizableHandle withHandle />}
                <ResizablePanel 
                  defaultSize={
                    isLeftPanelVisible && isCenterPanelVisible ? 25 :
                    isLeftPanelVisible || isCenterPanelVisible ? 50 :
                    100
                  }
                  minSize={20} 
                  maxSize={isCenterPanelVisible && isLeftPanelVisible ? 40 : 80}
                >
                  <div className="p-4 h-full overflow-auto space-y-4">
                    {editingStep && (
                      <Card className="border-primary/30 shadow-md">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                              <Settings className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-sm">
                                {editingStep.id ? 'Edit Step' : 'New Step'}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                Configure step properties and queries
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label>Step ID</Label>
                            <Input
                              value={stepForm.id || editingStep.id || ''}
                              onChange={(e) => setStepForm({ ...stepForm, id: e.target.value })}
                              placeholder="step-id"
                              disabled={!!editingStep.id}
                            />
                          </div>
                          <div>
                            <Label>Name</Label>
                            <Input
                              value={stepForm.name || ''}
                              onChange={(e) => setStepForm({ ...stepForm, name: e.target.value })}
                              placeholder="Step name"
                            />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={stepForm.description || ''}
                              onChange={(e) => setStepForm({ ...stepForm, description: e.target.value })}
                              placeholder="Step description"
                            />
                          </div>

                          <Separator />

                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <Label>Query Chain</Label>
                              <Button size="sm" variant="outline" onClick={handleAddQueryChainAction}>
                                <Plus className="w-3 h-3 mr-1" />
                                Add Query
                              </Button>
                            </div>
                            {queryChainForm.map((action, index) => (
                              <Card key={index} className="mb-2">
                                <CardContent className="pt-4 space-y-2">
                                  <Select
                                    value={action.queryName}
                                    onValueChange={(value) => handleUpdateQueryChainAction(index, 'queryName', value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select query" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {finalQueries.map(q => (
                                        <SelectItem key={q.name} value={q.name}>{q.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    value={action.resultKey}
                                    onChange={(e) => handleUpdateQueryChainAction(index, 'resultKey', e.target.value)}
                                    placeholder="Result key"
                                  />
                                  <Button size="sm" variant="ghost" onClick={() => handleRemoveQueryChainAction(index)}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>

                          <FormActionButtons
                            onSave={handleSaveStep}
                            onCancel={() => {
                              setEditingStep(null);
                              setStepForm({});
                              setQueryChainForm([]);
                            }}
                            saveLabel="Save Step"
                            className="pt-2"
                          />
                        </CardContent>
                      </Card>
                    )}

                    {editingField && (
                      <Card className="border-primary/30 shadow-md">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                              <Edit className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-sm">
                                {editingField.key ? 'Edit Field' : 'New Field'}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                Configure field properties and validation
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label>Key</Label>
                            <Input
                              value={fieldForm.key || ''}
                              onChange={(e) => setFieldForm({ ...fieldForm, key: e.target.value })}
                              placeholder="field_key"
                              disabled={!!editingField.key}
                            />
                          </div>
                          <div>
                            <Label>Label</Label>
                            <Input
                              value={fieldForm.label || ''}
                              onChange={(e) => setFieldForm({ ...fieldForm, label: e.target.value })}
                              placeholder="Field Label"
                            />
                          </div>
                          <div>
                            <Label>Type</Label>
                            <Select
                              value={fieldForm.type || 'text'}
                              onValueChange={(value) => setFieldForm({ ...fieldForm, type: value as FormField['type'] })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="password">Password</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="select">Select</SelectItem>
                                <SelectItem value="textarea">Textarea</SelectItem>
                                <SelectItem value="checkbox">Checkbox</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {fieldForm.type === 'select' && (
                            <>
                              <div>
                                <Label>Query (for options)</Label>
                                <Select
                                  value={fieldForm.queryName || ''}
                                  onValueChange={(value) => setFieldForm({ ...fieldForm, queryName: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select query" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {catalogQueries.map(q => (
                                      <SelectItem key={q.name} value={q.name}>{q.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Dependency Field</Label>
                                <Input
                                  value={fieldForm.dependencyKey || ''}
                                  onChange={(e) => setFieldForm({ ...fieldForm, dependencyKey: e.target.value })}
                                  placeholder="parent_field_key"
                                />
                              </div>
                            </>
                          )}

                          <div>
                            <Label>Placeholder</Label>
                            <Input
                              value={fieldForm.placeholder || ''}
                              onChange={(e) => setFieldForm({ ...fieldForm, placeholder: e.target.value })}
                              placeholder="Enter placeholder text"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Shown when field is empty</p>
                          </div>

                          <div>
                            <Label>Help Text</Label>
                            <Textarea
                              value={fieldForm.helpText || ''}
                              onChange={(e) => setFieldForm({ ...fieldForm, helpText: e.target.value })}
                              placeholder="Enter helpful information for users"
                              rows={2}
                            />
                            <p className="text-xs text-muted-foreground mt-1">Displayed in info tooltip next to label</p>
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

                          <FormActionButtons
                            onSave={handleSaveField}
                            onCancel={() => {
                              setEditingField(null);
                              setEditingFieldStepId(null);
                              setFieldForm({});
                            }}
                            saveLabel="Save Field"
                            className="pt-2"
                          />
                        </CardContent>
                      </Card>
                    )}

                    {!editingStep && !editingField && selectedStep && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Step Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div>
                              <Label>Name</Label>
                              <p className="text-sm text-muted-foreground">{selectedStep.name}</p>
                            </div>
                            {selectedStep.description && (
                              <div>
                                <Label>Description</Label>
                                <p className="text-sm text-muted-foreground">{selectedStep.description}</p>
                              </div>
                            )}
                            <div>
                              <Label>Fields</Label>
                              <p className="text-sm text-muted-foreground">
                                {selectedStep.formFields.length} field(s)
                              </p>
                            </div>
                            {selectedStep.queryChain && selectedStep.queryChain.length > 0 && (
                              <div>
                                <Label>Query Chain</Label>
                                <p className="text-sm text-muted-foreground">
                                  {selectedStep.queryChain.length} action(s)
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {!editingStep && !editingField && !selectedStep && selectedFlow && (
                      <div className="flex items-center justify-center min-h-[300px] text-muted-foreground">
                        <div className="text-center max-w-sm">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mx-auto mb-3">
                            <Settings className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <h5 className="text-foreground mb-1">No Step Selected</h5>
                          <p className="text-xs">Select or create a step to view and edit its details</p>
                        </div>
                      </div>
                    )}
                  </div>
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>
      </div>

      {/* Delete Flow Confirmation */}
      <AlertDialog open={showDeleteFlowDialog} onOpenChange={setShowDeleteFlowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Flow</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{flowToDelete?.flow.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteFlow}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DndProvider>
  );
};
