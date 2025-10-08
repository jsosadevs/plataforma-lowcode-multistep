import React, { useState } from 'react';
import { useAutomatedFlows } from '../hooks/useAutomatedFlows';
import { useFlowService } from '../hooks/useFlowService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { 
  Play, Pause, Square, Clock, Database, Calendar, Webhook, RotateCcw,
  Plus, Settings, Activity, AlertTriangle, CheckCircle, XCircle,
  Zap, Timer, BarChart3, Eye, Edit, Trash2, PlayCircle, StopCircle
} from 'lucide-react';
import { AutomatedFlowDesigner } from './AutomatedFlowDesigner';
import { TriggerDesigner } from './TriggerDesigner';
import { ExecutionMonitor } from './ExecutionMonitor';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { FlowRunnerModal } from './FlowRunnerModal';

interface AutomatedFlowsManagerProps {
  onPreviewFlow?: (flowId: string) => void;
}

export const AutomatedFlowsManager: React.FC<AutomatedFlowsManagerProps> = ({
  onPreviewFlow
}) => {
  const {
    automatedFlows,
    executions,
    isLoading,
    error,
    activateFlow,
    pauseFlow,
    disableFlow,
    manualTrigger,
    getExecutions,
    getActiveFlows,
    getUpcomingExecutions,
    convertFlowToAutomated
  } = useAutomatedFlows();

  const { flows } = useFlowService();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [showDesigner, setShowDesigner] = useState(false);
  const [showTriggerDesigner, setShowTriggerDesigner] = useState(false);
  const [runningFlowId, setRunningFlowId] = useState<string | null>(null);

  const activeFlows = getActiveFlows();
  const upcomingExecutions = getUpcomingExecutions();

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'database': return <Database className="w-4 h-4" />;
      case 'schedule': return <Calendar className="w-4 h-4" />;
      case 'webhook': return <Webhook className="w-4 h-4" />;
      case 'recurring': return <RotateCcw className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'disabled': return <Square className="w-4 h-4 text-gray-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    }
  };

  const getExecutionStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      running: 'secondary',
      failed: 'destructive',
      pending: 'outline',
      cancelled: 'secondary'
    };
    return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>{status}</Badge>;
  };

  const handleFlowAction = async (flowId: string, action: 'activate' | 'pause' | 'disable' | 'trigger') => {
    try {
      switch (action) {
        case 'activate':
          await activateFlow(flowId);
          break;
        case 'pause':
          await pauseFlow(flowId);
          break;
        case 'disable':
          await disableFlow(flowId);
          break;
        case 'trigger':
          await manualTrigger(flowId);
          break;
      }
    } catch (error) {
      console.error(`Failed to ${action} flow:`, error);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Automated Flows</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{automatedFlows.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Flows</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeFlows.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Executions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{executions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Execution</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {upcomingExecutions.length > 0 
                ? new Date(upcomingExecutions[0].nextExecution).toLocaleTimeString()
                : 'None scheduled'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common actions for automated flow management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={() => setShowDesigner(true)} className="flex items-center gap-2 h-auto p-4 justify-start">
              <div className="flex items-start space-x-3">
                <Plus className="w-5 h-5 mt-1 text-primary-foreground" />
                <div className="text-left">
                  <div className="font-medium">Create Automated Flow</div>
                  <div className="text-sm opacity-90">
                    Build new automation with templates or from scratch
                  </div>
                </div>
              </div>
            </Button>
            
            <Button variant="outline" onClick={() => setShowTriggerDesigner(true)} className="flex items-center gap-2 h-auto p-4 justify-start">
              <div className="flex items-start space-x-3">
                <Settings className="w-5 h-5 mt-1 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Configure Triggers</div>
                  <div className="text-sm text-muted-foreground">
                    Set up database, schedule, and webhook triggers
                  </div>
                </div>
              </div>
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 h-auto p-4 justify-start">
                  <div className="flex items-start space-x-3">
                    <Zap className="w-5 h-5 mt-1 text-primary" />
                    <div className="text-left">
                      <div className="font-medium">Convert Regular Flow</div>
                      <div className="text-sm text-muted-foreground">
                        Transform manual flows into automated ones
                      </div>
                    </div>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Convert Flow to Automated</DialogTitle>
                  <DialogDescription>
                    Transform an existing manual flow into an automated flow with triggers and scheduling capabilities.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Select a regular flow to convert into an automated flow with triggers.
                  </p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {flows.map(flow => (
                      <Card key={flow.id} className="cursor-pointer hover:bg-muted/50" 
                            onClick={() => convertFlowToAutomated(flow)}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{flow.name}</h4>
                              <p className="text-sm text-muted-foreground">{flow.description}</p>
                            </div>
                            <Badge variant="outline">{flow.steps.length} steps</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {flows.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No regular flows available to convert</p>
                        <p className="text-sm mt-1">Create flows in the Backoffice first</p>
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Executions */}
      {upcomingExecutions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Upcoming Executions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingExecutions.slice(0, 5).map(({ flow, nextExecution }, index) => (
                <div key={`${flow.id}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(flow.status)}
                    <div>
                      <p className="font-medium">{flow.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {nextExecution.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {flow.triggers.map(t => t.type).join(', ')}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => setRunningFlowId(flow.id)}>
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderFlowsList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Automated Flows</h3>
        <Button onClick={() => setShowDesigner(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Flow
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {automatedFlows.map(flow => (
          <Card key={flow.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(flow.status)}
                  <div>
                    <CardTitle className="text-base">{flow.name}</CardTitle>
                    <CardDescription className="mt-1">{flow.description}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Triggers */}
              <div>
                <p className="text-sm font-medium mb-2">Triggers</p>
                <div className="flex flex-wrap gap-1">
                  {flow.triggers.map((trigger, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <span className="mr-1">{getTriggerIcon(trigger.type)}</span>
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

              {/* Execution Stats */}
              <div className="text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Last execution:</span>
                  <span>{flow.lastExecution ? flow.lastExecution.toLocaleString() : 'Never'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Next execution:</span>
                  <span>{flow.nextExecution ? flow.nextExecution.toLocaleString() : 'Not scheduled'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={() => handleFlowAction(flow.id, 'trigger')} className="flex-1">
                  <PlayCircle className="w-3 h-3 mr-1" />
                  Run
                </Button>
                
                {flow.status === 'active' ? (
                  <Button size="sm" variant="outline" onClick={() => handleFlowAction(flow.id, 'pause')}>
                    <Pause className="w-3 h-3" />
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => handleFlowAction(flow.id, 'activate')}>
                    <Play className="w-3 h-3" />
                  </Button>
                )}
                
                <Button size="sm" variant="outline" onClick={() => setRunningFlowId(flow.id)}>
                  <Eye className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {automatedFlows.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No automated flows created yet</p>
          <Button onClick={() => setShowDesigner(true)} className="mt-4">
            Create Your First Automated Flow
          </Button>
        </div>
      )}
    </div>
  );

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error loading automated flows: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2>Automated Flows</h2>
        <p className="text-muted-foreground mt-2">
          Create and manage automated flows with database triggers, scheduling, and recurring executions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="flows" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Flows
          </TabsTrigger>
          <TabsTrigger value="executions" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Executions
          </TabsTrigger>
          <TabsTrigger value="triggers" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Triggers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="flows">
          {renderFlowsList()}
        </TabsContent>

        <TabsContent value="executions">
          <ExecutionMonitor 
            executions={executions}
            flows={automatedFlows}
            onViewFlow={(flowId) => setRunningFlowId(flowId)}
            onRetryExecution={async (executionId) => {
              try {
                // This would typically call a backend API
                console.log('Retrying execution:', executionId);
                // You could add toast notification here
              } catch (error) {
                console.error('Failed to retry execution:', error);
              }
            }}
            onCancelExecution={async (executionId) => {
              try {
                // This would typically call a backend API
                console.log('Cancelling execution:', executionId);
                // You could add toast notification here
              } catch (error) {
                console.error('Failed to cancel execution:', error);
              }
            }}
          />
        </TabsContent>

        <TabsContent value="triggers">
          <TriggerDesigner 
            flows={automatedFlows}
            onFlowUpdate={setSelectedFlowId}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showDesigner && (
        <AutomatedFlowDesigner
          isOpen={showDesigner}
          onClose={() => setShowDesigner(false)}
          flowId={selectedFlowId}
        />
      )}

      {runningFlowId && (
        <FlowRunnerModal
          flowId={runningFlowId}
          isOpen={!!runningFlowId}
          onClose={() => setRunningFlowId(null)}
          enableDesignMode={false}
        />
      )}
    </div>
  );
};