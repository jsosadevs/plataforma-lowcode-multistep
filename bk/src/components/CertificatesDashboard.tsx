import React, { useMemo } from 'react';
import { useFlowService } from '../hooks/useFlowService';
import { Flow, FlowGroup } from '../types/flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Play, FileText, CheckCircle } from 'lucide-react';
import { ActionButtons, useCommonActions } from './ActionButtons';

interface CertificatesDashboardProps {
  onRunFlow?: (flowId: string) => void;
}

export const CertificatesDashboard: React.FC<CertificatesDashboardProps> = ({ onRunFlow }) => {
  const { flowGroups } = useFlowService();
  const { createRunAction } = useCommonActions();

  // Filter only flows that are published (availableInCertificates: true)
  const publishedFlowGroups = useMemo((): FlowGroup[] => {
    return flowGroups
      .map(group => ({
        ...group,
        flows: group.flows.filter(flow => flow.availableInCertificates)
      }))
      .filter(group => group.flows.length > 0);
  }, [flowGroups]);

  const totalPublishedFlows = useMemo(() => {
    return publishedFlowGroups.reduce((total, group) => total + group.flows.length, 0);
  }, [publishedFlowGroups]);

  const renderFlowCard = (flow: Flow) => (
    <Card key={flow.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {flow.name}
            </CardTitle>
            <CardDescription className="mt-2">
              {flow.description}
            </CardDescription>
          </div>
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Published
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Steps Overview */}
          <div>
            <h4 className="text-sm mb-2">Process Steps:</h4>
            <div className="space-y-1">
              {flow.steps.map((step, index) => (
                <div key={step.id} className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                  <span className="flex-1">{step.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {step.formFields.length} {step.formFields.length === 1 ? 'field' : 'fields'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="w-full">
            <ActionButtons
              actions={[
                {
                  ...createRunAction(() => onRunFlow && onRunFlow(flow.id), flow.steps.length === 0),
                  label: 'Start Process'
                }
              ]}
              mode="inline"
              className="w-full"
              stopPropagation={false}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (totalPublishedFlows === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-xl mb-2">No Published Processes</h3>
        <p className="text-muted-foreground max-w-md">
          There are currently no published processes available. Contact your administrator 
          to publish flows that can be executed from this dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2>Available Certificates & Documents</h2>
        <p className="text-muted-foreground mt-2">
          Select a process below to generate certificates, documents, or complete administrative tasks.
        </p>
        <div className="mt-4">
          <Badge variant="outline" className="text-sm">
            {totalPublishedFlows} {totalPublishedFlows === 1 ? 'process' : 'processes'} available
          </Badge>
        </div>
      </div>

      {/* Flow Groups */}
      {publishedFlowGroups.map(group => (
        <div key={group.category} className="space-y-4">
          <div className="border-b pb-2">
            <h3 className="text-xl flex items-center gap-2">
              {group.category}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {group.flows.length} {group.flows.length === 1 ? 'process' : 'processes'} in this category
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {group.flows.map(flow => renderFlowCard(flow))}
          </div>
        </div>
      ))}
    </div>
  );
};
