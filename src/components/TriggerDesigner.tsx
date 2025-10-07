import React, { useState } from 'react';
import { FlowTrigger, DatabaseTrigger, ScheduleTrigger, WebhookTrigger, RecurringTrigger, AutomatedFlow } from '../types/flow';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { 
  Database, Calendar, Webhook, RotateCcw, Plus, Settings, 
  Clock, Server, Code, Zap, Edit, Save, X
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface TriggerDesignerProps {
  flows?: AutomatedFlow[];
  onFlowUpdate?: (flowId: string) => void;
  
  // Inline mode props
  trigger?: FlowTrigger | null;
  onTriggerCreate?: (trigger: FlowTrigger) => void;
  onTriggerUpdate?: (trigger: FlowTrigger) => void;
  isInline?: boolean;
}

export const TriggerDesigner: React.FC<TriggerDesignerProps> = ({
  flows = [],
  onFlowUpdate,
  trigger,
  onTriggerCreate,
  onTriggerUpdate,
  isInline = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [triggerType, setTriggerType] = useState<string>(trigger?.type || 'database');
  const [formData, setFormData] = useState<any>(trigger || {});

  const resetForm = () => {
    setTriggerType('database');
    setFormData({});
  };

  const handleSave = () => {
    const newTrigger = createTriggerFromForm();
    if (!newTrigger) return;

    if (trigger && onTriggerUpdate) {
      onTriggerUpdate(newTrigger);
      toast.success('Trigger updated successfully');
    } else if (onTriggerCreate) {
      onTriggerCreate(newTrigger);
      toast.success('Trigger created successfully');
    }

    setIsOpen(false);
    resetForm();
  };

  const createTriggerFromForm = (): FlowTrigger | null => {
    switch (triggerType) {
      case 'database':
        if (!formData.tableName || !formData.operation) {
          toast.error('Table name and operation are required');
          return null;
        }
        return {
          type: 'database',
          tableName: formData.tableName,
          operation: formData.operation,
          conditions: formData.conditions || [],
          debounceMs: formData.debounceMs || undefined
        } as DatabaseTrigger;

      case 'schedule':
        if (!formData.frequency || !formData.startDate) {
          toast.error('Frequency and start date are required');
          return null;
        }
        return {
          type: 'schedule',
          frequency: formData.frequency,
          startDate: new Date(formData.startDate),
          endDate: formData.endDate ? new Date(formData.endDate) : undefined,
          time: formData.time || undefined,
          timezone: formData.timezone || 'UTC',
          cronExpression: formData.cronExpression || undefined,
          weekdays: formData.weekdays || undefined,
          monthDay: formData.monthDay || undefined
        } as ScheduleTrigger;

      case 'webhook':
        if (!formData.url || !formData.method) {
          toast.error('URL and method are required');
          return null;
        }
        return {
          type: 'webhook',
          url: formData.url,
          method: formData.method,
          headers: formData.headers || {},
          authentication: formData.authentication || { type: 'none' }
        } as WebhookTrigger;

      case 'recurring':
        if (!formData.interval || formData.interval <= 0) {
          toast.error('Valid interval is required');
          return null;
        }
        return {
          type: 'recurring',
          interval: formData.interval,
          maxExecutions: formData.maxExecutions || undefined,
          retryPolicy: formData.retryPolicy || undefined
        } as RecurringTrigger;

      default:
        return null;
    }
  };

  const renderDatabaseTrigger = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="tableName">Table Name</Label>
        <Input
          id="tableName"
          value={formData.tableName || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, tableName: e.target.value }))}
          placeholder="Enter table name to monitor"
        />
      </div>

      <div>
        <Label htmlFor="operation">Database Operation</Label>
        <Select 
          value={formData.operation || ''} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, operation: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select operation to monitor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="insert">INSERT - New records added</SelectItem>
            <SelectItem value="update">UPDATE - Records modified</SelectItem>
            <SelectItem value="delete">DELETE - Records removed</SelectItem>
            <SelectItem value="any">ANY - All operations</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="debounce">Debounce (milliseconds)</Label>
        <Input
          id="debounce"
          type="number"
          min="0"
          max="60000"
          step="1000"
          value={formData.debounceMs || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, debounceMs: parseInt(e.target.value) || undefined }))}
          placeholder="Optional delay to prevent rapid firing"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Prevents multiple triggers from rapid database changes
        </p>
      </div>
    </div>
  );

  const renderScheduleTrigger = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="frequency">Frequency</Label>
        <Select 
          value={formData.frequency || ''} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select schedule frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="once">Once - Single execution</SelectItem>
            <SelectItem value="daily">Daily - Every day</SelectItem>
            <SelectItem value="weekly">Weekly - Every week</SelectItem>
            <SelectItem value="monthly">Monthly - Every month</SelectItem>
            <SelectItem value="yearly">Yearly - Every year</SelectItem>
            <SelectItem value="custom">Custom - Cron expression</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="endDate">End Date (Optional)</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
          />
        </div>
      </div>

      {formData.frequency !== 'custom' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={formData.time || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select 
              value={formData.timezone || 'UTC'} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Chicago">Central Time</SelectItem>
                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                <SelectItem value="Europe/London">London</SelectItem>
                <SelectItem value="Europe/Paris">Paris</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {formData.frequency === 'weekly' && (
        <div>
          <Label>Days of Week</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <Button
                key={day}
                variant={(formData.weekdays || []).includes(index) ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  const weekdays = formData.weekdays || [];
                  const newWeekdays = weekdays.includes(index)
                    ? weekdays.filter(d => d !== index)
                    : [...weekdays, index];
                  setFormData(prev => ({ ...prev, weekdays: newWeekdays }));
                }}
              >
                {day}
              </Button>
            ))}
          </div>
        </div>
      )}

      {formData.frequency === 'monthly' && (
        <div>
          <Label htmlFor="monthDay">Day of Month</Label>
          <Input
            id="monthDay"
            type="number"
            min="1"
            max="31"
            value={formData.monthDay || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, monthDay: parseInt(e.target.value) || undefined }))}
            placeholder="1-31"
          />
        </div>
      )}

      {formData.frequency === 'custom' && (
        <div>
          <Label htmlFor="cronExpression">Cron Expression</Label>
          <Input
            id="cronExpression"
            value={formData.cronExpression || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, cronExpression: e.target.value }))}
            placeholder="0 9 * * MON-FRI (9 AM on weekdays)"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Use standard cron format: minute hour day month weekday
          </p>
        </div>
      )}
    </div>
  );

  const renderRecurringTrigger = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="interval">Interval (minutes)</Label>
        <Input
          id="interval"
          type="number"
          min="1"
          max="1440"
          value={formData.interval || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, interval: parseInt(e.target.value) || 1 }))}
          placeholder="How often to run (1-1440 minutes)"
        />
      </div>

      <div>
        <Label htmlFor="maxExecutions">Max Executions (Optional)</Label>
        <Input
          id="maxExecutions"
          type="number"
          min="1"
          value={formData.maxExecutions || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, maxExecutions: parseInt(e.target.value) || undefined }))}
          placeholder="Leave empty for unlimited"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Stop after this many executions
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Retry Policy</CardTitle>
          <CardDescription>Configure retry behavior for failed executions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="maxRetries">Max Retries</Label>
            <Input
              id="maxRetries"
              type="number"
              min="0"
              max="10"
              value={formData.retryPolicy?.maxRetries || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                retryPolicy: { 
                  ...prev.retryPolicy, 
                  maxRetries: parseInt(e.target.value) || 0 
                } 
              }))}
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="retryDelay">Retry Delay (ms)</Label>
            <Input
              id="retryDelay"
              type="number"
              min="1000"
              max="300000"
              step="1000"
              value={formData.retryPolicy?.retryDelayMs || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                retryPolicy: { 
                  ...prev.retryPolicy, 
                  retryDelayMs: parseInt(e.target.value) || 5000 
                } 
              }))}
              placeholder="5000"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderWebhookTrigger = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="url">Webhook URL</Label>
        <Input
          id="url"
          type="url"
          value={formData.url || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
          placeholder="https://api.example.com/webhook"
        />
      </div>

      <div>
        <Label htmlFor="method">HTTP Method</Label>
        <Select 
          value={formData.method || ''} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, method: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select HTTP method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="PATCH">PATCH</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Authentication</CardTitle>
          <CardDescription>Configure authentication for the webhook</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Authentication Type</Label>
            <Select 
              value={formData.authentication?.type || 'none'} 
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                authentication: { type: value } 
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="bearer">Bearer Token</SelectItem>
                <SelectItem value="basic">Basic Auth</SelectItem>
                <SelectItem value="api_key">API Key</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.authentication?.type === 'bearer' && (
            <div>
              <Label htmlFor="token">Bearer Token</Label>
              <Input
                id="token"
                type="password"
                value={formData.authentication?.token || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  authentication: { 
                    ...prev.authentication, 
                    token: e.target.value 
                  } 
                }))}
                placeholder="Enter bearer token"
              />
            </div>
          )}

          {formData.authentication?.type === 'basic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.authentication?.username || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    authentication: { 
                      ...prev.authentication, 
                      username: e.target.value 
                    } 
                  }))}
                  placeholder="Username"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.authentication?.password || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    authentication: { 
                      ...prev.authentication, 
                      password: e.target.value 
                    } 
                  }))}
                  placeholder="Password"
                />
              </div>
            </div>
          )}

          {formData.authentication?.type === 'api_key' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="apiKeyHeader">Header Name</Label>
                <Input
                  id="apiKeyHeader"
                  value={formData.authentication?.apiKeyHeader || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    authentication: { 
                      ...prev.authentication, 
                      apiKeyHeader: e.target.value 
                    } 
                  }))}
                  placeholder="X-API-Key"
                />
              </div>
              <div>
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={formData.authentication?.apiKey || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    authentication: { 
                      ...prev.authentication, 
                      apiKey: e.target.value 
                    } 
                  }))}
                  placeholder="Enter API key"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderTriggerForm = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="triggerType">Trigger Type</Label>
        <Select value={triggerType} onValueChange={setTriggerType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="database">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Database - React to data changes
              </div>
            </SelectItem>
            <SelectItem value="schedule">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Schedule - Run at specific times
              </div>
            </SelectItem>
            <SelectItem value="recurring">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Recurring - Run at intervals
              </div>
            </SelectItem>
            <SelectItem value="webhook">
              <div className="flex items-center gap-2">
                <Webhook className="w-4 h-4" />
                Webhook - External API calls
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {triggerType === 'database' && renderDatabaseTrigger()}
      {triggerType === 'schedule' && renderScheduleTrigger()}
      {triggerType === 'recurring' && renderRecurringTrigger()}
      {triggerType === 'webhook' && renderWebhookTrigger()}
    </div>
  );

  if (isInline) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant={trigger ? "outline" : "default"}>
            {trigger ? <Edit className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            {!trigger && <span className="ml-1">Add Trigger</span>}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {trigger ? 'Edit Trigger' : 'Create Trigger'}
            </DialogTitle>
            <DialogDescription>
              {trigger 
                ? 'Modify the trigger configuration and settings'
                : 'Configure when and how this automated flow should be triggered'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[60vh]">
            {renderTriggerForm()}
          </div>
          
          <Separator />
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              {trigger ? 'Update' : 'Create'} Trigger
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Full trigger management interface for flows prop
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Trigger Management</h3>
        <p className="text-sm text-muted-foreground">
          Configure triggers for all automated flows
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {flows.map(flow => (
          <Card key={flow.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{flow.name}</CardTitle>
              <CardDescription>{flow.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-2">Triggers ({flow.triggers.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {flow.triggers.map((trigger, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {trigger.type}
                      </Badge>
                    ))}
                    {flow.triggers.length === 0 && (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        No triggers
                      </Badge>
                    )}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onFlowUpdate?.(flow.id)}
                  className="w-full"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};