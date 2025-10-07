import React, { useState, useMemo } from 'react';
import { AutomatedFlowExecution, AutomatedFlow } from '../types/flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { 
  Activity, Clock, CheckCircle, XCircle, AlertCircle, 
  Pause, Play, RotateCcw, Eye, Filter, Search,
  Database, Calendar, Webhook, Zap, RefreshCw
} from 'lucide-react';
// Helper function to format relative time
const formatDistance = (date: Date) => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  if (diffInHours > 0) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  if (diffInMinutes > 0) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

interface ExecutionMonitorProps {
  executions: AutomatedFlowExecution[];
  flows: AutomatedFlow[];
  onViewFlow?: (flowId: string) => void;
  onRetryExecution?: (executionId: string) => void;
  onCancelExecution?: (executionId: string) => void;
}

export const ExecutionMonitor: React.FC<ExecutionMonitorProps> = ({
  executions,
  flows,
  onViewFlow,
  onRetryExecution,
  onCancelExecution
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [flowFilter, setFlowFilter] = useState<string>('all');
  const [triggerFilter, setTriggerFilter] = useState<string>('all');

  const filteredExecutions = useMemo(() => {
    return executions.filter(execution => {
      const flow = flows.find(f => f.id === execution.flowId);
      const matchesSearch = !searchTerm || 
        flow?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        execution.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || execution.status === statusFilter;
      const matchesFlow = flowFilter === 'all' || execution.flowId === flowFilter;
      const matchesTrigger = triggerFilter === 'all' || execution.triggeredBy.type === triggerFilter;

      return matchesSearch && matchesStatus && matchesFlow && matchesTrigger;
    });
  }, [executions, flows, searchTerm, statusFilter, flowFilter, triggerFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'running': return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'cancelled': return <Pause className="w-4 h-4 text-gray-500" />;
      default: return <AlertCircle className="w-4 h-4 text-orange-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      running: 'secondary',
      failed: 'destructive',
      pending: 'outline',
      cancelled: 'secondary'
    };
    return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>{status}</Badge>;
  };

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'database': return <Database className="w-4 h-4" />;
      case 'schedule': return <Calendar className="w-4 h-4" />;
      case 'webhook': return <Webhook className="w-4 h-4" />;
      case 'recurring': return <RotateCcw className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const formatDuration = (durationMs?: number) => {
    if (!durationMs) return 'N/A';
    if (durationMs < 1000) return `${durationMs}ms`;
    return `${(durationMs / 1000).toFixed(1)}s`;
  };

  const getExecutionStats = () => {
    const total = executions.length;
    const completed = executions.filter(e => e.status === 'completed').length;
    const failed = executions.filter(e => e.status === 'failed').length;
    const running = executions.filter(e => e.status === 'running').length;
    const successRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0';

    return { total, completed, failed, running, successRate };
  };

  const stats = getExecutionStats();

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Running</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.running}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Input
                placeholder="Search executions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={flowFilter} onValueChange={setFlowFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All flows" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Flows</SelectItem>
                  {flows.map(flow => (
                    <SelectItem key={flow.id} value={flow.id}>
                      {flow.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={triggerFilter} onValueChange={setTriggerFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All triggers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Triggers</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="schedule">Schedule</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                  <SelectItem value="recurring">Recurring</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setFlowFilter('all');
                  setTriggerFilter('all');
                }}
                className="w-full"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Execution History ({filteredExecutions.length})
            </span>
            <Button size="sm" variant="outline">
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {filteredExecutions.map(execution => {
                const flow = flows.find(f => f.id === execution.flowId);
                
                return (
                  <Card key={execution.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(execution.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium truncate">
                              {flow?.name || 'Unknown Flow'}
                            </h4>
                            {getStatusBadge(execution.status)}
                          </div>
                          
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Started: {execution.startTime.toLocaleString()}
                              </span>
                              {execution.endTime && (
                                <span>
                                  Ended: {execution.endTime.toLocaleString()}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                {getTriggerIcon(execution.triggeredBy.type)}
                                Trigger: {execution.triggeredBy.type}
                              </span>
                              <span>
                                Duration: {formatDuration(execution.duration)}
                              </span>
                              {execution.retryCount && execution.retryCount > 0 && (
                                <span>
                                  Retries: {execution.retryCount}
                                </span>
                              )}
                            </div>

                            {execution.errorMessage && (
                              <div className="text-red-600 text-xs bg-red-50 p-2 rounded mt-2">
                                {execution.errorMessage}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {execution.status === 'running' && onCancelExecution && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onCancelExecution(execution.id)}
                          >
                            <Pause className="w-3 h-3" />
                          </Button>
                        )}
                        
                        {execution.status === 'failed' && onRetryExecution && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onRetryExecution(execution.id)}
                          >
                            <RotateCcw className="w-3 h-3" />
                          </Button>
                        )}
                        
                        {onViewFlow && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewFlow(execution.flowId)}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Additional execution details */}
                    {(execution.inputData || execution.outputData) && (
                      <div className="mt-3 pt-3 border-t space-y-2">
                        {execution.inputData && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                              Input Data
                            </summary>
                            <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                              {JSON.stringify(execution.inputData, null, 2)}
                            </pre>
                          </details>
                        )}
                        
                        {execution.outputData && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                              Output Data
                            </summary>
                            <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                              {JSON.stringify(execution.outputData, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    )}

                    {/* Execution logs */}
                    {execution.logs && execution.logs.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                            Execution Logs ({execution.logs.length})
                          </summary>
                          <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                            {execution.logs.map((log, index) => (
                              <div key={index} className="flex items-start gap-2 text-xs">
                                <span className="text-muted-foreground font-mono">
                                  {log.timestamp.toLocaleTimeString()}
                                </span>
                                <Badge 
                                  variant={log.level === 'error' ? 'destructive' : 'outline'}
                                  className="text-xs px-1 py-0"
                                >
                                  {log.level}
                                </Badge>
                                <span className="flex-1">{log.message}</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}
                  </Card>
                );
              })}

              {filteredExecutions.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No executions found</p>
                  {searchTerm || statusFilter !== 'all' || flowFilter !== 'all' || triggerFilter !== 'all' ? (
                    <p className="text-sm mt-1">Try adjusting your filters</p>
                  ) : (
                    <p className="text-sm mt-1">Automated flows will appear here when they run</p>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};