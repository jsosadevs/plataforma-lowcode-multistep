import React, { useState } from 'react';
import { Flow, FlowGroup } from '../types/flow';
import { useFlowService } from '../hooks/useFlowService';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Plus, 
  Workflow, 
  Lock, 
  Unlock,
  Copy,
  Trash2,
  Edit,
  ArrowRight,
  FileText,
  MoreVertical,
  Move,
  Palette,
  Eye
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { FormActionButtons } from './FormActionButtons';
import { ActionButtons, useCommonActions } from './ActionButtons';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';

interface FlowGroupManagerProps {
  selectedGroup: string;
  onFlowSelect?: (flowId: string) => void;
  onPreviewFlow?: (flowId: string) => void;
  selectedFlow?: string;
  onOpenUIDesigner?: (flowId: string) => void;
  showUIDesignerAction?: boolean;
}

export const FlowGroupManager: React.FC<FlowGroupManagerProps> = ({ 
  selectedGroup, 
  onFlowSelect,
  onPreviewFlow,
  selectedFlow,
  onOpenUIDesigner,
  showUIDesignerAction = false
}) => {
  const {
    flowGroups,
    createFlow,
    updateFlow,
    deleteFlow,
    duplicateFlow,
    toggleFlowLock,
    moveFlowBetweenGroups
  } = useFlowService();

  const { createEditAction, createDeleteAction, createRunAction, createDuplicateAction } = useCommonActions();

  const [isCreatingFlow, setIsCreatingFlow] = useState(false);
  const [editingFlow, setEditingFlow] = useState<Flow | null>(null);
  const [flowForm, setFlowForm] = useState<Partial<Flow>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [flowToDelete, setFlowToDelete] = useState<Flow | null>(null);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [flowToMove, setFlowToMove] = useState<Flow | null>(null);
  const [targetGroup, setTargetGroup] = useState<string>('');

  const currentGroup = flowGroups.find(g => g.category === selectedGroup);
  const otherGroups = flowGroups.filter(g => g.category !== selectedGroup);

  const handleCreateFlow = () => {
    if (!flowForm.name?.trim()) {
      toast.error('Flow name is required');
      return;
    }

    const newFlow: Flow = {
      id: `flow-${Date.now()}`,
      name: flowForm.name.trim(),
      description: flowForm.description || '',
      steps: [],
      availableInCertificates: flowForm.availableInCertificates || false,
      created: new Date(),
      updated: new Date()
    };

    createFlow(newFlow, selectedGroup);
    toast.success('Flow created successfully');
    setFlowForm({});
    setIsCreatingFlow(false);
    onFlowSelect?.(newFlow.id);
  };

  const handleEditFlow = () => {
    if (!editingFlow || !flowForm.name?.trim()) {
      toast.error('Flow name is required');
      return;
    }

    const updatedFlow: Flow = {
      ...editingFlow,
      name: flowForm.name.trim(),
      description: flowForm.description || '',
      availableInCertificates: flowForm.availableInCertificates || false,
      updated: new Date()
    };

    updateFlow(updatedFlow);
    toast.success('Flow updated successfully');
    setEditingFlow(null);
    setFlowForm({});
  };

  const handleDeleteFlow = () => {
    if (!flowToDelete) return;

    if (flowToDelete.locked) {
      toast.error('Cannot delete a locked flow');
      return;
    }

    deleteFlow(flowToDelete.id, selectedGroup);
    toast.success('Flow deleted successfully');
    setShowDeleteDialog(false);
    setFlowToDelete(null);
    
    if (selectedFlow === flowToDelete.id) {
      onFlowSelect?.('');
    }
  };

  const handleDuplicateFlow = (flow: Flow) => {
    const newFlowId = duplicateFlow(flow.id);
    if (newFlowId) {
      toast.success('Flow duplicated successfully');
      onFlowSelect?.(newFlowId);
    } else {
      toast.error('Failed to duplicate flow');
    }
  };

  const handleMoveFlow = () => {
    if (!flowToMove || !targetGroup) return;

    if (moveFlowBetweenGroups(flowToMove.id, selectedGroup, targetGroup)) {
      toast.success(`Flow moved to ${targetGroup}`);
      setShowMoveDialog(false);
      setFlowToMove(null);
      setTargetGroup('');
      if (selectedFlow === flowToMove.id) {
        onFlowSelect?.('');
      }
    } else {
      toast.error('Failed to move flow');
    }
  };

  const startEdit = (flow: Flow) => {
    if (flow.locked) {
      toast.error('Cannot edit a locked flow');
      return;
    }
    setEditingFlow(flow);
    setFlowForm(flow);
  };

  const cancelEdit = () => {
    setEditingFlow(null);
    setFlowForm({});
  };

  const startDelete = (flow: Flow) => {
    setFlowToDelete(flow);
    setShowDeleteDialog(true);
  };

  const startMove = (flow: Flow) => {
    setFlowToMove(flow);
    setShowMoveDialog(true);
  };

  if (!currentGroup) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <div className="text-center">
          <Workflow className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Select a group to manage flows</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Flows in {selectedGroup}</h3>
          <p className="text-sm text-muted-foreground">
            {currentGroup.flows.length} flow{currentGroup.flows.length !== 1 ? 's' : ''} in this group
          </p>
        </div>
        <Button onClick={() => setIsCreatingFlow(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Flow
        </Button>
      </div>

      {isCreatingFlow && (
        <Card className="border-primary/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Workflow className="w-4 h-4 text-primary" />
              Create New Flow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="flow-name">Flow Name</Label>
              <Input
                id="flow-name"
                value={flowForm.name || ''}
                onChange={(e) => setFlowForm({ ...flowForm, name: e.target.value })}
                placeholder="Enter flow name"
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="flow-description">Description</Label>
              <Textarea
                id="flow-description"
                value={flowForm.description || ''}
                onChange={(e) => setFlowForm({ ...flowForm, description: e.target.value })}
                placeholder="Enter flow description"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="available-certificates"
                checked={flowForm.availableInCertificates || false}
                onCheckedChange={(checked) => setFlowForm({ ...flowForm, availableInCertificates: checked })}
              />
              <Label htmlFor="available-certificates">Available in Certificates</Label>
            </div>
            <FormActionButtons
              onSave={handleCreateFlow}
              onCancel={() => setIsCreatingFlow(false)}
              saveLabel="Create"
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {currentGroup.flows.map(flow => (
          <Card 
            key={flow.id} 
            className={`hover:shadow-sm transition-all cursor-pointer ${
              selectedFlow === flow.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onFlowSelect?.(flow.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                {editingFlow?.id === flow.id ? (
                  <div className="flex-1 mr-4 space-y-3">
                    <Input
                      value={flowForm.name || ''}
                      onChange={(e) => setFlowForm({ ...flowForm, name: e.target.value })}
                      placeholder="Flow name"
                      autoFocus
                    />
                    <Textarea
                      value={flowForm.description || ''}
                      onChange={(e) => setFlowForm({ ...flowForm, description: e.target.value })}
                      placeholder="Flow description"
                      rows={2}
                    />
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={flowForm.availableInCertificates || false}
                        onCheckedChange={(checked) => setFlowForm({ ...flowForm, availableInCertificates: checked })}
                      />
                      <Label>Available in Certificates</Label>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Workflow className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {flow.name}
                        {flow.locked && <Lock className="w-4 h-4 text-muted-foreground" />}
                      </CardTitle>
                      <CardDescription>
                        {flow.description || 'No description provided'}
                      </CardDescription>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  {editingFlow?.id === flow.id ? (
                    <FormActionButtons
                      onSave={handleEditFlow}
                      onCancel={cancelEdit}
                      saveLabel="Save"
                      size="sm"
                    />
                  ) : (
                    <>
                      <div className="flex items-center gap-1 mr-2">
                        <Badge variant="outline" className="text-xs">
                          {flow.steps.length} steps
                        </Badge>
                        {flow.availableInCertificates && (
                          <Badge variant="secondary" className="text-xs">
                            <FileText className="w-3 h-3 mr-1" />
                            Certificates
                          </Badge>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onPreviewFlow && flow.steps.length > 0 && (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              onPreviewFlow(flow.id);
                            }}>
                              <ArrowRight className="w-4 h-4 mr-2" />
                              Run Flow
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(flow);
                            }}
                            disabled={flow.locked}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Flow
                          </DropdownMenuItem>
                          {showUIDesignerAction && onOpenUIDesigner && flow.steps.length > 0 && (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              onOpenUIDesigner(flow.id);
                            }}>
                              <Palette className="w-4 h-4 mr-2" />
                              Customize UI
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFlowLock(flow.id);
                              toast.success(`Flow ${flow.locked ? 'unlocked' : 'locked'}`);
                            }}
                          >
                            {flow.locked ? (
                              <>
                                <Unlock className="w-4 h-4 mr-2" />
                                Unlock Flow
                              </>
                            ) : (
                              <>
                                <Lock className="w-4 h-4 mr-2" />
                                Lock Flow
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateFlow(flow);
                          }}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          {otherGroups.length > 0 && (
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                startMove(flow);
                              }}
                              disabled={flow.locked}
                            >
                              <Move className="w-4 h-4 mr-2" />
                              Move to Group
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              startDelete(flow);
                            }}
                            disabled={flow.locked}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            
            {flow.steps.length > 0 && (
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <div className="w-1 h-4 bg-primary/50 rounded-full"></div>
                    <span>Flow steps</span>
                  </div>
                  {flow.steps.slice(0, 3).map((step, index) => (
                    <div key={step.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                        {index + 1}
                      </div>
                      <span className="text-sm">{step.name}</span>
                      <Badge variant="outline" className="text-xs ml-auto">
                        {step.formFields.length} fields
                      </Badge>
                    </div>
                  ))}
                  {flow.steps.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center py-1">
                      +{flow.steps.length - 3} more steps
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {currentGroup.flows.length === 0 && (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <div className="text-center">
            <Workflow className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No flows in this group yet</p>
            <p className="text-sm mt-1">Create your first flow to get started</p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Flow</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{flowToDelete?.name}"? 
              This action cannot be undone and will remove all steps and configuration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFlow}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Move Flow Dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Flow</DialogTitle>
            <DialogDescription>
              Choose the destination group for "{flowToMove?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="target-group">Destination Group</Label>
              <Select value={targetGroup} onValueChange={setTargetGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination group" />
                </SelectTrigger>
                <SelectContent>
                  {otherGroups.map(group => (
                    <SelectItem key={group.category} value={group.category}>
                      {group.category} ({group.flows.length} flows)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <FormActionButtons
              onSave={handleMoveFlow}
              onCancel={() => setShowMoveDialog(false)}
              saveLabel="Move"
              disabled={!targetGroup}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};