import React, { useState } from 'react';
import { FlowDesignerDnD } from './components/FlowDesignerDnD';
import { FlowRunnerModal } from './components/FlowRunnerModal';
import { Backoffice } from './components/Backoffice';
import { CertificatesDashboard } from './components/CertificatesDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { useFlowService } from './hooks/useFlowService';
import { useQueryManager } from './hooks/useQueryManager';
import { useAutomatedFlows } from './hooks/useAutomatedFlows';
import { useFlowRunner } from './hooks/useFlowRunner';
import { Play, Settings, Database, Workflow, Eye, FileText, Briefcase, Zap } from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { ActionButtons, useCommonActions } from './components/ActionButtons';
import { AutomatedFlowsManager } from './components/AutomatedFlowsManager';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const { flowGroups, flows } = useFlowService();
  const { queries } = useQueryManager();
  const { createRunAction, createViewAction } = useCommonActions();
  const { automatedFlows, getActiveFlows } = useAutomatedFlows();

  const {
    runFlow,
    closeRunner,
    handleComplete,
    isRunning,
    runningFlowId,
    flowExecutionContext,
  } = useFlowRunner({
    onComplete: (flowData: any) => {
      console.log('Flow completed with data:', flowData);
      // Here you could send data to a backend, show a success message, etc.
    },
  });

  const renderOverview = () => (
    <div className="space-y-6">
      <div>
        <h2>Low-Code Flow Platform</h2>
        <p className="text-muted-foreground mt-2">
          A metadata-driven platform for creating and executing dynamic multi-step processes like onboarding, 
          document generation, and data collection workflows with responsive design.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manual Flows</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flows.length}</div>
            <p className="text-xs text-muted-foreground">
              User-triggered flows
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automated Flows</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{automatedFlows.length}</div>
            <p className="text-xs text-muted-foreground">
              {getActiveFlows().length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Queries</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{queries.length}</div>
            <p className="text-xs text-muted-foreground">
              Reusable data queries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Steps</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {flows.reduce((total, flow) => total + flow.steps.length, 0) +
               automatedFlows.reduce((total, flow) => total + flow.steps.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all flows
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>
            Get started with the responsive flow platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 justify-start"
              onClick={() => setActiveTab('certificates')}
            >
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 mt-1 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Certificates</div>
                  <div className="text-sm text-muted-foreground">
                    Access published processes and generate documents
                  </div>
                </div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 justify-start"
              onClick={() => setActiveTab('automated')}
            >
              <div className="flex items-start space-x-3">
                <Zap className="w-5 h-5 mt-1 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Automated Flows</div>
                  <div className="text-sm text-muted-foreground">
                    Create scheduled and trigger-based workflows
                  </div>
                </div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 justify-start"
              onClick={() => setActiveTab('backoffice')}
            >
              <div className="flex items-start space-x-3">
                <Briefcase className="w-5 h-5 mt-1 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Backoffice</div>
                  <div className="text-sm text-muted-foreground">
                    Design responsive flows and manage queries
                  </div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Platform Features</CardTitle>
          <CardDescription>
            Key capabilities of the Responsive Low-Code Flow Platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Responsive Architecture</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Adaptive UI for mobile, tablet, and desktop</li>
                <li>• Dynamic layout configuration</li>
                <li>• Touch-optimized interactions</li>
                <li>• Breakpoint-aware components</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Automation & Triggers</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Database change triggers</li>
                <li>• Scheduled execution (cron-like)</li>
                <li>• Webhook-based automation</li>
                <li>• Recurring process management</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Flow Orchestration</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Multi-device process continuity</li>
                <li>• Responsive progress tracking</li>
                <li>• Execution monitoring & logs</li>
                <li>• Retry policies & error handling</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Advanced Features</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Drag & drop flow designer</li>
                <li>• Real-time execution monitoring</li>
                <li>• Email notifications</li>
                <li>• Parametrized flow execution</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFlowList = () => (
    <div className="space-y-6">
      <div>
        <h2>Available Flows</h2>
        <p className="text-muted-foreground mt-2">
          Execute any of the configured flows organized by groups - optimized for all devices
        </p>
      </div>

      {flowGroups.map(group => (
        <Card key={group.category} className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">{group.category}</CardTitle>
                  <CardDescription>
                    {group.flows.length} responsive flow{group.flows.length !== 1 ? 's' : ''} available
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-background">
                {group.flows.length} flows
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {group.flows.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.flows.map(flow => (
                  <Card key={flow.id} className="relative hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            {flow.name}
                            {flow.locked && <Badge variant="outline" className="text-xs">Locked</Badge>}
                          </CardTitle>
                          <CardDescription className="mt-1 line-clamp-2">
                            {flow.description || 'No description provided'}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {flow.steps.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="w-1 h-4 bg-primary/50 rounded-full"></div>
                              <span>Flow Steps</span>
                            </div>
                            <div className="space-y-1">
                              {flow.steps.slice(0, 3).map((step, index) => (
                                <div key={step.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                                    {index + 1}
                                  </div>
                                  <span className="text-sm truncate">{step.name}</span>
                                  <Badge variant="secondary" className="text-xs ml-auto">
                                    {step.formFields.length}
                                  </Badge>
                                </div>
                              ))}
                              {flow.steps.length > 3 && (
                                <div className="text-xs text-muted-foreground text-center py-1">
                                  +{flow.steps.length - 3} more steps
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={() => runFlow(flow.id, 'flows')}
                            className="flex-1"
                            disabled={flow.steps.length === 0}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Run Flow
                          </Button>
                          <ActionButtons
                            actions={[
                              createViewAction(() => setActiveTab('backoffice'), false)
                            ]}
                            mode="inline"
                            stopPropagation={false}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <Workflow className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No flows created in this group yet</p>
                <p className="text-sm mt-1">
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => setActiveTab('backoffice')}
                  >
                    Go to Backoffice
                  </Button> to create flows
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {flowGroups.length === 0 && (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <div className="text-center">
            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No flow groups found</p>
            <p className="text-sm mt-1">
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => setActiveTab('backoffice')}
              >
                Switch to Backoffice
              </Button> to create groups and flows
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Responsive Low-Code Flow Platform</h1>
          <p className="text-muted-foreground">
            Metadata-driven platform for creating dynamic multi-step workflows - optimized for all devices
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="certificates" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Certificates</span>
            </TabsTrigger>
            <TabsTrigger value="flows" className="flex items-center space-x-2">
              <Play className="w-4 h-4" />
              <span>Manual Flows</span>
            </TabsTrigger>
            <TabsTrigger value="automated" className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Automated</span>
            </TabsTrigger>
            <TabsTrigger value="backoffice" className="flex items-center space-x-2">
              <Briefcase className="w-4 h-4" />
              <span>Backoffice</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {renderOverview()}
          </TabsContent>

          <TabsContent value="certificates">
            <CertificatesDashboard onRunFlow={(flowId) => runFlow(flowId, 'certificates')} />
          </TabsContent>

          <TabsContent value="flows">
            {renderFlowList()}
          </TabsContent>

          <TabsContent value="automated">
            <AutomatedFlowsManager onPreviewFlow={(flowId) => runFlow(flowId, 'flows')} />
          </TabsContent>

          <TabsContent value="backoffice">
            <Backoffice onPreviewFlow={(flowId) => runFlow(flowId, 'backoffice')} />
          </TabsContent>
        </Tabs>

        {/* Responsive Flow Runner Modal */}
        <FlowRunnerModal
          flowId={runningFlowId}
          isOpen={isRunning}
          onClose={closeRunner}
          onComplete={handleComplete}
          enableDesignMode={flowExecutionContext === 'backoffice'}
        />

        <Toaster />
      </div>
    </div>
  );
}