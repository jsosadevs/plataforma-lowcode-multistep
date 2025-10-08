import React, { useState } from 'react';
import { FlowGroup } from '../types/flow';
import { useFlowService } from '../hooks/useFlowService';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { 
  FolderPlus, 
  Edit, 
  Trash2, 
  Folder, 
  ArrowRight,
  AlertCircle,
  MoreVertical
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { FormActionButtons } from './FormActionButtons';
import { ActionButtons, useCommonActions } from './ActionButtons';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

interface GroupManagerProps {
  compact?: boolean;
  onGroupSelect?: (category: string) => void;
  selectedGroup?: string;
}

export const GroupManager: React.FC<GroupManagerProps> = ({ 
  compact = false, 
  onGroupSelect,
  selectedGroup 
}) => {
  const {
    flowGroups,
    createFlowGroup,
    updateFlowGroup,
    deleteFlowGroup
  } = useFlowService();

  const { createEditAction, createDeleteAction } = useCommonActions();

  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [groupForm, setGroupForm] = useState({ category: '' });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);

  const handleCreateGroup = () => {
    if (!groupForm.category.trim()) {
      toast.error('Group name is required');
      return;
    }

    if (createFlowGroup(groupForm.category.trim())) {
      toast.success('Group created successfully');
      setGroupForm({ category: '' });
      setIsCreatingGroup(false);
      onGroupSelect?.(groupForm.category.trim());
    } else {
      toast.error('A group with this name already exists');
    }
  };

  const handleEditGroup = (oldCategory: string) => {
    if (!groupForm.category.trim()) {
      toast.error('Group name is required');
      return;
    }

    if (updateFlowGroup(oldCategory, groupForm.category.trim())) {
      toast.success('Group updated successfully');
      setGroupForm({ category: '' });
      setEditingGroup(null);
      onGroupSelect?.(groupForm.category.trim());
    } else {
      toast.error('A group with this name already exists');
    }
  };

  const handleDeleteGroup = (category: string) => {
    const group = flowGroups.find(g => g.category === category);
    if (!group) return;

    if (group.flows.length > 0) {
      toast.error('Cannot delete group with flows. Move or delete flows first.');
      return;
    }

    if (deleteFlowGroup(category)) {
      toast.success('Group deleted successfully');
      setShowDeleteDialog(false);
      setGroupToDelete(null);
      if (selectedGroup === category) {
        onGroupSelect?.(flowGroups.length > 1 ? flowGroups[0].category : '');
      }
    } else {
      toast.error('Failed to delete group');
    }
  };

  const startEdit = (category: string) => {
    setEditingGroup(category);
    setGroupForm({ category });
  };

  const cancelEdit = () => {
    setEditingGroup(null);
    setGroupForm({ category: '' });
  };

  const startDelete = (category: string) => {
    setGroupToDelete(category);
    setShowDeleteDialog(true);
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Groups</h4>
          <Dialog open={isCreatingGroup} onOpenChange={setIsCreatingGroup}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                <FolderPlus className="w-3 h-3" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
                <DialogDescription>
                  Create a new group to organize your flows
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category">Group Name</Label>
                  <Input
                    id="category"
                    value={groupForm.category}
                    onChange={(e) => setGroupForm({ category: e.target.value })}
                    placeholder="Enter group name"
                    autoFocus
                  />
                </div>
                <FormActionButtons
                  onSave={handleCreateGroup}
                  onCancel={() => setIsCreatingGroup(false)}
                  saveLabel="Create"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-1">
          {flowGroups.map(group => (
            <button
              key={group.category}
              onClick={() => onGroupSelect?.(group.category)}
              className={`w-full text-left p-2 rounded-md transition-colors text-sm ${
                selectedGroup === group.category
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Folder className="w-3 h-3" />
                  <span className="truncate">{group.category}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {group.flows.length}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Flow Groups</h3>
          <p className="text-sm text-muted-foreground">
            Organize your flows into logical groups
          </p>
        </div>
        <Button onClick={() => setIsCreatingGroup(true)} className="gap-2">
          <FolderPlus className="w-4 h-4" />
          New Group
        </Button>
      </div>

      {isCreatingGroup && (
        <Card className="border-primary/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-primary" />
              Create New Group
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="new-category">Group Name</Label>
              <Input
                id="new-category"
                value={groupForm.category}
                onChange={(e) => setGroupForm({ category: e.target.value })}
                placeholder="Enter group name"
                autoFocus
              />
            </div>
            <FormActionButtons
              onSave={handleCreateGroup}
              onCancel={() => setIsCreatingGroup(false)}
              saveLabel="Create"
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {flowGroups.map(group => (
          <Card key={group.category} className="hover:shadow-sm transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                {editingGroup === group.category ? (
                  <div className="flex-1 mr-4">
                    <Input
                      value={groupForm.category}
                      onChange={(e) => setGroupForm({ category: e.target.value })}
                      placeholder="Group name"
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Folder className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{group.category}</CardTitle>
                      <CardDescription>
                        {group.flows.length} flow{group.flows.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  {editingGroup === group.category ? (
                    <FormActionButtons
                      onSave={() => handleEditGroup(group.category)}
                      onCancel={cancelEdit}
                      saveLabel="Save"
                      size="sm"
                    />
                  ) : (
                    <>
                      <Badge variant="outline" className="text-xs">
                        {group.flows.length} flows
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => startEdit(group.category)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Group
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => startDelete(group.category)}
                            disabled={group.flows.length > 0}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Group
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            
            {group.flows.length > 0 && (
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <div className="w-1 h-4 bg-primary/50 rounded-full"></div>
                    <span>Flows in this group</span>
                  </div>
                  {group.flows.slice(0, 3).map(flow => (
                    <div key={flow.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                        <span className="text-sm">{flow.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {flow.steps.length} steps
                        </Badge>
                        {flow.locked && (
                          <Badge variant="outline" className="text-xs">
                            Locked
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {group.flows.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center py-1">
                      +{group.flows.length - 3} more flows
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {flowGroups.length === 0 && (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <div className="text-center">
            <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No groups created yet</p>
            <p className="text-sm mt-1">Create your first group to organize flows</p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the group "{groupToDelete}"? 
              This action cannot be undone.
              {flowGroups.find(g => g.category === groupToDelete)?.flows.length > 0 && (
                <div className="mt-2 p-2 bg-destructive/10 text-destructive rounded-md">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  This group contains flows and cannot be deleted.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => groupToDelete && handleDeleteGroup(groupToDelete)}
              disabled={flowGroups.find(g => g.category === groupToDelete)?.flows.length > 0}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};