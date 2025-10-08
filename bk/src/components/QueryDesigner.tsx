import React, { useState } from 'react';
import { CustomQuery, QueryParameter } from '../types/flow';
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Plus, 
  Trash2, 
  Save,
  X,
  Lock,
  Unlock,
  Edit,
  Database,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ActionButtons, useCommonActions } from './ActionButtons';

export const QueryDesigner: React.FC = () => {
  const { queries, createQuery, updateQuery, deleteQuery, toggleQueryLock } = useQueryManager();
  const { createEditAction, createDeleteAction, createLockAction } = useCommonActions();
  
  const [selectedQuery, setSelectedQuery] = useState<CustomQuery | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [queryToDelete, setQueryToDelete] = useState<CustomQuery | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<CustomQuery>>({
    name: '',
    description: '',
    targetEndpoint: '',
    isCatalog: false,
    parameters: []
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      targetEndpoint: '',
      isCatalog: false,
      parameters: []
    });
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleSelectQuery = (query: CustomQuery) => {
    setSelectedQuery(query);
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleNewQuery = () => {
    setIsCreating(true);
    setIsEditing(false);
    setSelectedQuery(null);
    resetForm();
  };

  const handleEditQuery = (query: CustomQuery) => {
    if (query.locked) {
      toast.error('Cannot edit a locked query');
      return;
    }
    setIsEditing(true);
    setIsCreating(false);
    setSelectedQuery(query);
    setFormData({ ...query });
  };

  const handleSaveQuery = () => {
    // Validation
    if (!formData.name || !formData.description || !formData.targetEndpoint) {
      toast.error('Name, description, and target endpoint are required');
      return;
    }

    // Validate name format (UPPER_SNAKE_CASE)
    if (!/^[A-Z0-9_]+$/.test(formData.name)) {
      toast.error('Query name must be in UPPER_SNAKE_CASE format');
      return;
    }

    // Validate endpoint format
    if (!/^[A-Z_]+$|^\/[a-zA-Z0-9_\-\/]+$/.test(formData.targetEndpoint)) {
      toast.error('Invalid endpoint format');
      return;
    }

    const queryData: CustomQuery = {
      name: formData.name!,
      description: formData.description!,
      targetEndpoint: formData.targetEndpoint!,
      isCatalog: formData.isCatalog || false,
      parameters: formData.parameters || [],
      locked: false
    };

    if (isCreating) {
      const result = createQuery(queryData);
      if (!result.success) {
        toast.error(result.error || 'Failed to create query');
        return;
      }
      toast.success('Query created successfully');
      setSelectedQuery(queryData);
    } else if (isEditing) {
      const result = updateQuery(queryData);
      if (!result.success) {
        toast.error(result.error || 'Failed to update query');
        return;
      }
      toast.success('Query updated successfully');
      setSelectedQuery(queryData);
    }

    resetForm();
  };

  const handleDeleteQuery = (query: CustomQuery) => {
    if (query.locked) {
      toast.error('Cannot delete a locked query');
      return;
    }
    setQueryToDelete(query);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (queryToDelete) {
      const result = deleteQuery(queryToDelete.name);
      if (!result.success) {
        toast.error(result.error || 'Failed to delete query');
      } else {
        toast.success('Query deleted successfully');
        if (selectedQuery?.name === queryToDelete.name) {
          setSelectedQuery(null);
          resetForm();
        }
      }
    }
    setShowDeleteDialog(false);
    setQueryToDelete(null);
  };

  const handleToggleLock = (queryName: string) => {
    toggleQueryLock(queryName);
    const query = queries.find(q => q.name === queryName);
    if (query?.locked && (isEditing || isCreating)) {
      resetForm();
      setSelectedQuery(query);
    }
  };

  const handleAddParameter = () => {
    const newParam: QueryParameter = {
      key: '',
      label: '',
      type: 'string',
      required: false
    };
    setFormData({
      ...formData,
      parameters: [...(formData.parameters || []), newParam]
    });
  };

  const handleUpdateParameter = (index: number, field: keyof QueryParameter, value: any) => {
    const params = [...(formData.parameters || [])];
    params[index] = { ...params[index], [field]: value };
    setFormData({ ...formData, parameters: params });
  };

  const handleRemoveParameter = (index: number) => {
    const params = [...(formData.parameters || [])];
    params.splice(index, 1);
    setFormData({ ...formData, parameters: params });
  };

  const catalogQueries = queries.filter(q => q.isCatalog);
  const finalQueries = queries.filter(q => !q.isCatalog);

  const renderQueryList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3>Queries</h3>
        <Button onClick={handleNewQuery} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Query
        </Button>
      </div>

      {/* Catalog Queries */}
      <div className="space-y-2">
        <h4 className="text-sm">Catalog Queries</h4>
        {catalogQueries.map(query => (
          <Card 
            key={query.name}
            className={`cursor-pointer transition-colors ${
              selectedQuery?.name === query.name ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleSelectQuery(query)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {query.locked && <Lock className="w-3 h-3 text-yellow-500" />}
                    <span className="truncate">{query.name}</span>
                  </CardTitle>
                  <CardDescription className="text-xs truncate">
                    {query.parameters.length} parameters
                  </CardDescription>
                </div>
                <ActionButtons
                  actions={[
                    createEditAction(() => handleEditQuery(query), query.locked),
                    createDeleteAction(() => handleDeleteQuery(query), query.locked)
                  ]}
                />
              </div>
            </CardHeader>
          </Card>
        ))}
        {catalogQueries.length === 0 && (
          <p className="text-sm text-muted-foreground italic">No catalog queries</p>
        )}
      </div>

      <Separator />

      {/* Final Queries */}
      <div className="space-y-2">
        <h4 className="text-sm">Final Queries</h4>
        {finalQueries.map(query => (
          <Card 
            key={query.name}
            className={`cursor-pointer transition-colors ${
              selectedQuery?.name === query.name ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleSelectQuery(query)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {query.locked && <Lock className="w-3 h-3 text-yellow-500" />}
                    <span className="truncate">{query.name}</span>
                  </CardTitle>
                  <CardDescription className="text-xs truncate">
                    {query.parameters.length} parameters
                  </CardDescription>
                </div>
                <ActionButtons
                  actions={[
                    createEditAction(() => handleEditQuery(query), query.locked),
                    createDeleteAction(() => handleDeleteQuery(query), query.locked)
                  ]}
                />
              </div>
            </CardHeader>
          </Card>
        ))}
        {finalQueries.length === 0 && (
          <p className="text-sm text-muted-foreground italic">No final queries</p>
        )}
      </div>
    </div>
  );

  const renderQueryDetails = () => {
    if (!selectedQuery && !isCreating && !isEditing) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Select a query to view details or create a new one</p>
          </div>
        </div>
      );
    }

    if (isCreating || isEditing) {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3>{isCreating ? 'New Query' : 'Edit Query'}</h3>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={resetForm}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveQuery}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="query-name">Name (UPPER_SNAKE_CASE)</Label>
              <Input
                id="query-name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                placeholder="GET_USERS"
                disabled={isEditing} // Name can't be changed when editing
              />
            </div>

            <div>
              <Label htmlFor="query-description">Description</Label>
              <Textarea
                id="query-description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this query does"
              />
            </div>

            <div>
              <Label htmlFor="query-endpoint">Target Endpoint</Label>
              <Input
                id="query-endpoint"
                value={formData.targetEndpoint || ''}
                onChange={(e) => setFormData({ ...formData, targetEndpoint: e.target.value })}
                placeholder="GET_USERS or /api/users"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="query-catalog"
                checked={formData.isCatalog || false}
                onCheckedChange={(checked) => setFormData({ ...formData, isCatalog: checked })}
              />
              <Label htmlFor="query-catalog">Catalog Query (for dropdowns)</Label>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4>Parameters</h4>
                <Button size="sm" variant="outline" onClick={handleAddParameter}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Parameter
                </Button>
              </div>

              {formData.parameters && formData.parameters.length > 0 ? (
                <div className="space-y-3">
                  {formData.parameters.map((param, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Key</Label>
                            <Input
                              value={param.key}
                              onChange={(e) => handleUpdateParameter(index, 'key', e.target.value)}
                              placeholder="paramKey"
                            />
                          </div>
                          <div>
                            <Label>Label</Label>
                            <Input
                              value={param.label}
                              onChange={(e) => handleUpdateParameter(index, 'label', e.target.value)}
                              placeholder="Parameter Label"
                            />
                          </div>
                          <div>
                            <Label>Type</Label>
                            <Select
                              value={param.type}
                              onValueChange={(value) => handleUpdateParameter(index, 'type', value as QueryParameter['type'])}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="string">String</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-end justify-between">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`param-required-${index}`}
                                checked={param.required}
                                onChange={(e) => handleUpdateParameter(index, 'required', e.target.checked)}
                              />
                              <Label htmlFor={`param-required-${index}`}>Required</Label>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveParameter(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No parameters defined. Click "Add Parameter" to create one.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>
      );
    }

    // View mode
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h3>{selectedQuery!.name}</h3>
            {selectedQuery!.locked && (
              <Badge variant="secondary">
                <Lock className="w-3 h-3 mr-1" />
                Locked
              </Badge>
            )}
            {selectedQuery!.isCatalog && (
              <Badge variant="outline">Catalog</Badge>
            )}
          </div>
          <ActionButtons
            actions={[
              createLockAction(() => handleToggleLock(selectedQuery!.name), selectedQuery!.locked),
              createEditAction(() => handleEditQuery(selectedQuery!), selectedQuery!.locked)
            ]}
            mode="inline"
            stopPropagation={false}
          />
        </div>

        <div className="space-y-4">
          <div>
            <Label>Description</Label>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedQuery!.description}
            </p>
          </div>

          <div>
            <Label>Target Endpoint</Label>
            <p className="text-sm text-muted-foreground mt-1 font-mono">
              {selectedQuery!.targetEndpoint}
            </p>
          </div>

          <Separator />

          <div>
            <h4 className="mb-3">Parameters ({selectedQuery!.parameters.length})</h4>
            {selectedQuery!.parameters.length > 0 ? (
              <div className="space-y-2">
                {selectedQuery!.parameters.map((param, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{param.label}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {param.key}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {param.type}
                        </Badge>
                        {param.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No parameters defined for this query.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="grid grid-cols-12 gap-6 h-full">
        {/* Query List Panel */}
        <div className="col-span-4 border-r pr-6">
          {renderQueryList()}
        </div>

        {/* Query Details/Editor Panel */}
        <div className="col-span-8">
          {renderQueryDetails()}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Query</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the query "{queryToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
