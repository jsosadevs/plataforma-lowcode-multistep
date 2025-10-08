import React, { useState, useEffect } from 'react';
import { useAutomatedFlows } from '../hooks/useAutomatedFlows';
import { useFlowService } from '../hooks/useFlowService';
import { AutomatedFlow, FlowTrigger, TriggerStatus } from '../types/flow';
import { 
  FullscreenDialog, 
  FullscreenDialogContent, 
  FullscreenDialogDescription, 
  FullscreenDialogHeader, 
  FullscreenDialogTitle,
  FullscreenDialogClose 
} from './ui/fullscreen-dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { 
  Database, Calendar, Webhook, RotateCcw, Plus, Trash2, 
  Settings, Clock, Mail, AlertTriangle, Save, X, Zap 
} from 'lucide-react';
import { TriggerDesigner } from './TriggerDesigner';
import { FlowDesignerDnD } from './FlowDesignerDnD';
import { AutomatedFlowTemplates } from './AutomatedFlowTemplates';
import { toast } from 'sonner@2.0.3';

interface AutomatedFlowDesignerProps {
  isOpen: boolean;
  onClose: () => void;
  flowId?: string | null;
}

export const AutomatedFlowDesigner: React.FC<AutomatedFlowDesignerProps> = ({
  isOpen,
  onClose,
  flowId
}) => {
  const { 
    automatedFlows, 
    createAutomatedFlow, 
    updateAutomatedFlow,
    convertFlowToAutomated 
  } = useAutomatedFlows();
  const { flows } = useFlowService();

  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'paused' as TriggerStatus,
    maxConcurrentExecutions: 1,
    timeoutMs: 300000,
    steps: [] as any[],
    triggers: [] as FlowTrigger[],
    parameters: {} as any,
    notifications: {
      onSuccess: [] as string[],
      onFailure: [] as string[],
      onStart: [] as string[]
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBaseFlow, setSelectedBaseFlow] = useState<string>('');
  const [showTemplates, setShowTemplates] = useState(false);

  // Load existing flow data
  useEffect(() => {
    if (flowId) {
      const flow = automatedFlows.find(f => f.id === flowId);
      if (flow) {
        setFormData({
          name: flow.name,
          description: flow.description || '',
          status: flow.status,
          maxConcurrentExecutions: flow.maxConcurrentExecutions || 1,
          timeoutMs: flow.timeoutMs || 300000,
          steps: flow.steps,
          triggers: flow.triggers,
          parameters: flow.parameters || {},
          notifications: flow.notifications || {
            onSuccess: [],
            onFailure: [],
            onStart: []
          }
        });
      }
    }
  }, [flowId, automatedFlows]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Flow name is required');
      return;
    }

    if (formData.triggers.length === 0) {
      toast.error('At least one trigger is required');
      return;
    }

    setIsLoading(true);
    try {
      if (flowId) {
        await updateAutomatedFlow(flowId, formData);
        toast.success('Automated flow updated successfully');
      } else {
        await createAutomatedFlow(formData);
        toast.success('Automated flow created successfully');
      }
      onClose();
    } catch (error) {
      toast.error('Failed to save automated flow');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFromBase = async () => {
    if (!selectedBaseFlow) return;
    
    const baseFlow = flows.find(f => f.id === selectedBaseFlow);
    if (!baseFlow) return;

    setFormData(prev => ({
      ...prev,
      name: `Automated ${baseFlow.name}`,
      description: `Automated version of ${baseFlow.description || baseFlow.name}`,
      steps: baseFlow.steps
    }));
    setActiveTab('triggers');
    toast.success('Base flow loaded - configure triggers to complete setup');
  };

  const handleTemplateSelect = (template: any) => {
    // Convert template to flow format
    const templateSteps = template.steps.map((step: any, index: number) => ({
      id: `step-${index + 1}`,
      name: step.name,
      description: step.description,
      formFields: [],
      queryChain: []
    }));

    setFormData(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      steps: templateSteps,
      triggers: [] // Will be configured in next step
    }));
    
    setActiveTab('triggers');
    setShowTemplates(false);
    toast.success(`Template "${template.name}" loaded - configure triggers to complete setup`);
  };

  const addTrigger = (trigger: FlowTrigger) => {
    setFormData(prev => ({
      ...prev,
      triggers: [...prev.triggers, trigger]
    }));
  };

  const updateTrigger = (index: number, trigger: FlowTrigger) => {
    setFormData(prev => ({
      ...prev,
      triggers: prev.triggers.map((t, i) => i === index ? trigger : t)
    }));
  };

  const removeTrigger = (index: number) => {
    setFormData(prev => ({
      ...prev,
      triggers: prev.triggers.filter((_, i) => i !== index)
    }));
  };

  const addNotificationEmail = (type: 'onSuccess' | 'onFailure' | 'onStart', email: string) => {
    if (!email.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: [...(prev.notifications[type] || []), email.trim()]
      }
    }));
  };

  const removeNotificationEmail = (type: 'onSuccess' | 'onFailure' | 'onStart', index: number) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: prev.notifications[type]?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'database': return <Database className="w-4 h-4" />;
      case 'schedule': return <Calendar className="w-4 h-4" />;
      case 'webhook': return <Webhook className="w-4 h-4" />;
      case 'recurring': return <RotateCcw className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const renderBasicTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Flow Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter flow name"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this automated flow does"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="status">Initial Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as TriggerStatus }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active - Flow will run when triggered</SelectItem>
                <SelectItem value="paused">Paused - Flow exists but won't run</SelectItem>
                <SelectItem value="disabled">Disabled - Flow is turned off</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="maxConcurrent">Max Concurrent Executions</Label>
            <Input
              id="maxConcurrent"
              type="number"
              min="1"
              max="10"
              value={formData.maxConcurrentExecutions}
              onChange={(e) => setFormData(prev => ({ ...prev, maxConcurrentExecutions: parseInt(e.target.value) || 1 }))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Maximum number of simultaneous executions allowed
            </p>
          </div>

          <div>
            <Label htmlFor="timeout">Timeout (milliseconds)</Label>
            <Input
              id="timeout"
              type="number"
              min="30000"
              max="1800000"
              step="30000"
              value={formData.timeoutMs}
              onChange={(e) => setFormData(prev => ({ ...prev, timeoutMs: parseInt(e.target.value) || 300000 }))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Maximum execution time before timeout (30s - 30min)
            </p>
          </div>
        </div>
      </div>

      {/* Create from templates or existing flows */}
      {!flowId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Start from Template</CardTitle>
              <CardDescription>
                Use pre-built templates for common automation workflows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Choose from user onboarding, daily reports, security monitoring, and more.
              </p>
              <Button onClick={() => setShowTemplates(true)} variant="outline" className="w-full">
                <Zap className="w-4 h-4 mr-2" />
                Browse Templates
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Create from Existing Flow</CardTitle>
              <CardDescription>
                Start with an existing flow and add automation triggers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Base Flow</Label>
                <Select value={selectedBaseFlow} onValueChange={setSelectedBaseFlow}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a flow to automate" />
                  </SelectTrigger>
                  <SelectContent>
                    {flows.map(flow => (
                      <SelectItem key={flow.id} value={flow.id}>
                        {flow.name} - {flow.steps.length} steps
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateFromBase} disabled={!selectedBaseFlow} variant="outline" className="w-full">
                Load Flow Structure
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Choose a Template</CardTitle>
          </CardHeader>
          <CardContent>
            <AutomatedFlowTemplates
              onSelectTemplate={handleTemplateSelect}
              onClose={() => setShowTemplates(false)}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderTriggersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Triggers Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Configure when and how this flow should be automatically executed
          </p>
        </div>
        <TriggerDesigner
          onTriggerCreate={addTrigger}
          trigger={null}
          isInline={true}
        />
      </div>

      {formData.triggers.length > 0 ? (
        <div className="space-y-4">
          {formData.triggers.map((trigger, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTriggerIcon(trigger.type)}
                    <div>
                      <CardTitle className="text-base capitalize">{trigger.type} Trigger</CardTitle>
                      <CardDescription>
                        {trigger.type === 'database' && `Monitor ${(trigger as any).tableName} table`}
                        {trigger.type === 'schedule' && `Run ${(trigger as any).frequency}`}
                        {trigger.type === 'webhook' && `HTTP ${(trigger as any).method} endpoint`}
                        {trigger.type === 'recurring' && `Every ${(trigger as any).interval} minutes`}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <TriggerDesigner
                      trigger={trigger}
                      onTriggerUpdate={(updatedTrigger) => updateTrigger(index, updatedTrigger)}
                      isInline={true}
                    />
                    <Button size="sm" variant="destructive" onClick={() => removeTrigger(index)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  {trigger.type === 'database' && (
                    <>
                      <div><strong>Table:</strong> {(trigger as any).tableName}</div>
                      <div><strong>Operation:</strong> {(trigger as any).operation}</div>
                      {(trigger as any).debounceMs && (
                        <div><strong>Debounce:</strong> {(trigger as any).debounceMs}ms</div>
                      )}
                    </>
                  )}
                  {trigger.type === 'schedule' && (
                    <>
                      <div><strong>Frequency:</strong> {(trigger as any).frequency}</div>
                      {(trigger as any).time && <div><strong>Time:</strong> {(trigger as any).time}</div>}
                      {(trigger as any).timezone && <div><strong>Timezone:</strong> {(trigger as any).timezone}</div>}
                    </>
                  )}
                  {trigger.type === 'recurring' && (
                    <>
                      <div><strong>Interval:</strong> {(trigger as any).interval} minutes</div>
                      {(trigger as any).maxExecutions && (
                        <div><strong>Max Executions:</strong> {(trigger as any).maxExecutions}</div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No Triggers Configured</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This flow needs at least one trigger to be automated. Add a trigger to specify when this flow should run.
            </p>
            <TriggerDesigner
              onTriggerCreate={addTrigger}
              trigger={null}
              isInline={true}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderStepsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Flow Steps Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Design the automated flow steps and their execution sequence
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Settings className="w-3 h-3" />
          {formData.steps.length} step{formData.steps.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {formData.steps.length > 0 ? (
        <div className="space-y-4">
          {formData.steps.map((step, index) => (
            <Card key={step.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <CardTitle className="text-base">{step.name}</CardTitle>
                      <CardDescription>{step.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {step.formFields.length} field{step.formFields.length !== 1 ? 's' : ''}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {step.queryChain?.length || 0} quer{(step.queryChain?.length || 0) !== 1 ? 'ies' : 'y'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h5 className="text-sm font-medium mb-2">Form Fields</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {step.formFields.map((field, fieldIndex) => (
                        <div key={fieldIndex} className="p-2 bg-muted/50 rounded text-xs">
                          <div className="font-medium">{field.label}</div>
                          <div className="text-muted-foreground">
                            {field.type} {field.required && '(required)'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {step.queryChain && step.queryChain.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium mb-2">Query Chain</h5>
                      <div className="space-y-2">
                        {step.queryChain.map((query, queryIndex) => (
                          <div key={queryIndex} className="p-2 bg-muted/50 rounded text-xs">
                            <div className="font-medium">{query.queryName}</div>
                            <div className="text-muted-foreground">
                              Result key: {query.resultKey}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-2">No Steps Configured</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This automated flow needs steps to define what actions to perform when triggered.
            </p>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                You can add steps by:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Loading from an existing flow in the Basic Info tab</li>
                <li>• Using the Flow Designer to create custom steps</li>
                <li>• Importing steps from templates</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedBaseFlow && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Advanced Step Configuration</CardTitle>
            <CardDescription>
              Additional options for step execution and error handling
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Step Timeout (seconds)</Label>
                <Input
                  type="number"
                  min="10"
                  max="300"
                  defaultValue="60"
                  placeholder="60"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum time allowed per step
                </p>
              </div>
              <div>
                <Label>Retry Policy</Label>
                <Select defaultValue="default">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No retries</SelectItem>
                    <SelectItem value="default">Default (3 retries)</SelectItem>
                    <SelectItem value="aggressive">Aggressive (5 retries)</SelectItem>
                    <SelectItem value="custom">Custom configuration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="parallel" />
              <Label htmlFor="parallel" className="text-sm">
                Allow parallel step execution when possible
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="skiponfail" />
              <Label htmlFor="skiponfail" className="text-sm">
                Continue execution if non-critical steps fail
              </Label>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderNotificationsTab = () => {
    const [newEmails, setNewEmails] = useState({
      onSuccess: '',
      onFailure: '',
      onStart: ''
    });

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Notification Settings</h3>
          <p className="text-sm text-muted-foreground">
            Configure email notifications for different flow execution events
          </p>
        </div>

        {/* Success Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="w-4 h-4 text-green-500" />
              Success Notifications
            </CardTitle>
            <CardDescription>
              Emails sent when flow execution completes successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address"
                value={newEmails.onSuccess}
                onChange={(e) => setNewEmails(prev => ({ ...prev, onSuccess: e.target.value }))}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addNotificationEmail('onSuccess', newEmails.onSuccess);
                    setNewEmails(prev => ({ ...prev, onSuccess: '' }));
                  }
                }}
              />
              <Button 
                onClick={() => {
                  addNotificationEmail('onSuccess', newEmails.onSuccess);
                  setNewEmails(prev => ({ ...prev, onSuccess: '' }));
                }}
                disabled={!newEmails.onSuccess.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.notifications.onSuccess?.map((email, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {email}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeNotificationEmail('onSuccess', index)}
                  />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Failure Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="w-4 h-4 text-red-500" />
              Failure Notifications
            </CardTitle>
            <CardDescription>
              Emails sent when flow execution fails or times out
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address"
                value={newEmails.onFailure}
                onChange={(e) => setNewEmails(prev => ({ ...prev, onFailure: e.target.value }))}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addNotificationEmail('onFailure', newEmails.onFailure);
                    setNewEmails(prev => ({ ...prev, onFailure: '' }));
                  }
                }}
              />
              <Button 
                onClick={() => {
                  addNotificationEmail('onFailure', newEmails.onFailure);
                  setNewEmails(prev => ({ ...prev, onFailure: '' }));
                }}
                disabled={!newEmails.onFailure.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.notifications.onFailure?.map((email, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {email}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeNotificationEmail('onFailure', index)}
                  />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Start Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-500" />
              Start Notifications
            </CardTitle>
            <CardDescription>
              Emails sent when flow execution begins
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address"
                value={newEmails.onStart}
                onChange={(e) => setNewEmails(prev => ({ ...prev, onStart: e.target.value }))}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addNotificationEmail('onStart', newEmails.onStart);
                    setNewEmails(prev => ({ ...prev, onStart: '' }));
                  }
                }}
              />
              <Button 
                onClick={() => {
                  addNotificationEmail('onStart', newEmails.onStart);
                  setNewEmails(prev => ({ ...prev, onStart: '' }));
                }}
                disabled={!newEmails.onStart.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.notifications.onStart?.map((email, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {email}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeNotificationEmail('onStart', index)}
                  />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Configure how and when to send notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="batchNotifications" />
              <Label htmlFor="batchNotifications" className="text-sm">
                Batch notifications for recurring flows (max 1 per hour)
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="includeData" />
              <Label htmlFor="includeData" className="text-sm">
                Include execution data in notifications
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="onlyFailures" />
              <Label htmlFor="onlyFailures" className="text-sm">
                Only send notifications for failures and errors
              </Label>
            </div>

            <div>
              <Label htmlFor="notificationFormat">Notification Format</Label>
              <Select defaultValue="html">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="html">HTML - Rich formatting</SelectItem>
                  <SelectItem value="text">Plain Text - Simple format</SelectItem>
                  <SelectItem value="json">JSON - Technical details</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <FullscreenDialog open={isOpen} onOpenChange={onClose}>
      <FullscreenDialogContent className="flex flex-col">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-6 border-b bg-background">
          <FullscreenDialogHeader className="flex-1">
            <FullscreenDialogTitle className="text-2xl">
              {flowId ? 'Edit Automated Flow' : 'Create Automated Flow'}
            </FullscreenDialogTitle>
            <FullscreenDialogDescription className="text-base">
              {flowId 
                ? 'Modify the configuration, triggers, and settings for this automated flow'
                : 'Create a new automated flow with triggers, scheduling, and notification settings'
              }
            </FullscreenDialogDescription>
          </FullscreenDialogHeader>
          <FullscreenDialogClose asChild>
            <Button variant="ghost" size="icon" className="ml-4">
              <X className="h-6 w-6" />
            </Button>
          </FullscreenDialogClose>
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-hidden p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="triggers">Triggers</TabsTrigger>
              <TabsTrigger value="steps">Flow Steps</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1">
              <TabsContent value="basic" className="mt-0 space-y-6">
                {renderBasicTab()}
              </TabsContent>

              <TabsContent value="triggers" className="mt-0 space-y-6">
                {renderTriggersTab()}
              </TabsContent>

              <TabsContent value="steps" className="mt-0 space-y-6">
                {renderStepsTab()}
              </TabsContent>

              <TabsContent value="notifications" className="mt-0 space-y-6">
                {renderNotificationsTab()}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="border-t bg-background p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {formData.triggers.length} trigger{formData.triggers.length !== 1 ? 's' : ''} configured
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Settings className="w-4 h-4" />
                {formData.steps.length} step{formData.steps.length !== 1 ? 's' : ''} defined
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                {(formData.notifications.onSuccess?.length || 0) + (formData.notifications.onFailure?.length || 0) + (formData.notifications.onStart?.length || 0)} notification{((formData.notifications.onSuccess?.length || 0) + (formData.notifications.onFailure?.length || 0) + (formData.notifications.onStart?.length || 0)) !== 1 ? 's' : ''}
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              {activeTab !== 'notifications' && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const tabs = ['basic', 'triggers', 'steps', 'notifications'];
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex < tabs.length - 1) {
                      setActiveTab(tabs[currentIndex + 1]);
                    }
                  }}
                >
                  Next Step
                </Button>
              )}
              <Button onClick={handleSave} disabled={isLoading || !formData.name || formData.triggers.length === 0}>
                {isLoading ? 'Saving...' : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {flowId ? 'Update Flow' : 'Create Flow'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </FullscreenDialogContent>
    </FullscreenDialog>
  );
};