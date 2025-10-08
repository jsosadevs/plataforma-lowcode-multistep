import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Mail, 
  Database, 
  Calendar, 
  FileText, 
  Users, 
  BarChart3,
  Shield,
  Zap,
  Clock,
  Webhook,
  RotateCcw
} from 'lucide-react';

interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  triggers: string[];
  estimatedSetupTime: string;
  complexity: 'Simple' | 'Moderate' | 'Advanced';
  useCases: string[];
  steps: {
    name: string;
    description: string;
  }[];
}

const FLOW_TEMPLATES: FlowTemplate[] = [
  {
    id: 'user-onboarding',
    name: 'User Onboarding Automation',
    description: 'Automatically onboard new users with welcome emails, setup guides, and initial configuration',
    category: 'User Management',
    icon: <Users className="w-5 h-5" />,
    triggers: ['database'],
    estimatedSetupTime: '15 minutes',
    complexity: 'Simple',
    useCases: ['New user registration', 'Account activation', 'Initial setup'],
    steps: [
      { name: 'Send Welcome Email', description: 'Personalized welcome message with getting started guide' },
      { name: 'Create User Profile', description: 'Initialize user profile with default settings' },
      { name: 'Send Setup Instructions', description: 'Step-by-step setup guide via email' },
      { name: 'Schedule Follow-up', description: 'Schedule follow-up check after 3 days' }
    ]
  },
  {
    id: 'daily-reports',
    name: 'Daily Analytics Reports',
    description: 'Generate and distribute daily analytics reports to stakeholders',
    category: 'Reporting',
    icon: <BarChart3 className="w-5 h-5" />,
    triggers: ['schedule'],
    estimatedSetupTime: '20 minutes',
    complexity: 'Moderate',
    useCases: ['Daily summaries', 'Performance tracking', 'Stakeholder updates'],
    steps: [
      { name: 'Collect Data', description: 'Gather analytics data from multiple sources' },
      { name: 'Generate Report', description: 'Create formatted report with charts and insights' },
      { name: 'Send to Recipients', description: 'Email report to predefined list of stakeholders' },
      { name: 'Archive Report', description: 'Store report in document management system' }
    ]
  },
  {
    id: 'security-monitoring',
    name: 'Security Alert System',
    description: 'Monitor security events and automatically respond to threats',
    category: 'Security',
    icon: <Shield className="w-5 h-5" />,
    triggers: ['database', 'webhook'],
    estimatedSetupTime: '30 minutes',
    complexity: 'Advanced',
    useCases: ['Failed login attempts', 'Suspicious activity', 'System breaches'],
    steps: [
      { name: 'Detect Threat', description: 'Monitor for security-related events' },
      { name: 'Assess Risk', description: 'Evaluate threat level and impact' },
      { name: 'Send Alerts', description: 'Notify security team immediately' },
      { name: 'Take Action', description: 'Automatically block or mitigate threat' }
    ]
  },
  {
    id: 'document-approval',
    name: 'Document Approval Workflow',
    description: 'Automate document review and approval processes',
    category: 'Document Management',
    icon: <FileText className="w-5 h-5" />,
    triggers: ['database'],
    estimatedSetupTime: '25 minutes',
    complexity: 'Moderate',
    useCases: ['Contract reviews', 'Policy approvals', 'Content publishing'],
    steps: [
      { name: 'Route Document', description: 'Send document to appropriate reviewer' },
      { name: 'Track Status', description: 'Monitor review progress and deadlines' },
      { name: 'Send Reminders', description: 'Automated reminders for pending reviews' },
      { name: 'Finalize Approval', description: 'Process final approval and archive' }
    ]
  },
  {
    id: 'backup-monitoring',
    name: 'Backup Monitoring System',
    description: 'Monitor backup processes and alert on failures',
    category: 'System Administration',
    icon: <Database className="w-5 h-5" />,
    triggers: ['schedule', 'webhook'],
    estimatedSetupTime: '20 minutes',
    complexity: 'Moderate',
    useCases: ['Database backups', 'File system backups', 'Cloud sync monitoring'],
    steps: [
      { name: 'Check Backup Status', description: 'Verify completion of scheduled backups' },
      { name: 'Validate Integrity', description: 'Test backup file integrity' },
      { name: 'Send Status Report', description: 'Daily backup status summary' },
      { name: 'Alert on Failures', description: 'Immediate alerts for backup failures' }
    ]
  },
  {
    id: 'customer-feedback',
    name: 'Customer Feedback Automation',
    description: 'Automatically collect and process customer feedback',
    category: 'Customer Service',
    icon: <Mail className="w-5 h-5" />,
    triggers: ['schedule', 'database'],
    estimatedSetupTime: '18 minutes',
    complexity: 'Simple',
    useCases: ['Post-purchase surveys', 'Service feedback', 'Product reviews'],
    steps: [
      { name: 'Send Survey', description: 'Email customer satisfaction survey' },
      { name: 'Collect Responses', description: 'Gather and categorize feedback' },
      { name: 'Analyze Sentiment', description: 'Automatic sentiment analysis' },
      { name: 'Route to Teams', description: 'Send feedback to relevant departments' }
    ]
  }
];

interface AutomatedFlowTemplatesProps {
  onSelectTemplate: (template: FlowTemplate) => void;
  onClose: () => void;
}

export const AutomatedFlowTemplates: React.FC<AutomatedFlowTemplatesProps> = ({
  onSelectTemplate,
  onClose
}) => {
  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'database': return <Database className="w-3 h-3" />;
      case 'schedule': return <Calendar className="w-3 h-3" />;
      case 'webhook': return <Webhook className="w-3 h-3" />;
      case 'recurring': return <RotateCcw className="w-3 h-3" />;
      default: return <Zap className="w-3 h-3" />;
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Simple': return 'bg-green-100 text-green-800';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = Array.from(new Set(FLOW_TEMPLATES.map(t => t.category)));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Flow Templates</h3>
        <p className="text-sm text-muted-foreground">
          Start with pre-built automation templates for common workflows
        </p>
      </div>

      {categories.map(category => (
        <div key={category} className="space-y-4">
          <h4 className="font-medium text-base border-b pb-2">{category}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FLOW_TEMPLATES.filter(template => template.category === category).map(template => (
              <Card key={template.id} className="relative hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {template.icon}
                      </div>
                      <div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {template.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Triggers and Complexity */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Triggers:</span>
                      {template.triggers.map(trigger => (
                        <Badge key={trigger} variant="outline" className="text-xs flex items-center gap-1">
                          {getTriggerIcon(trigger)}
                          {trigger}
                        </Badge>
                      ))}
                    </div>
                    <Badge className={`text-xs ${getComplexityColor(template.complexity)}`}>
                      {template.complexity}
                    </Badge>
                  </div>

                  {/* Setup Time */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>Est. setup time: {template.estimatedSetupTime}</span>
                  </div>

                  {/* Use Cases */}
                  <div>
                    <p className="text-xs font-medium mb-1">Use Cases:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.useCases.slice(0, 3).map((useCase, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {useCase}
                        </Badge>
                      ))}
                      {template.useCases.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.useCases.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Steps Preview */}
                  <div>
                    <p className="text-xs font-medium mb-2">Steps ({template.steps.length}):</p>
                    <div className="space-y-1">
                      {template.steps.slice(0, 2).map((step, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded text-xs">
                          <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{step.name}</div>
                            <div className="text-muted-foreground">{step.description}</div>
                          </div>
                        </div>
                      ))}
                      {template.steps.length > 2 && (
                        <div className="text-xs text-muted-foreground text-center py-1">
                          +{template.steps.length - 2} more steps
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    onClick={() => onSelectTemplate(template)}
                    className="w-full"
                    size="sm"
                  >
                    Use This Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Skip Templates
        </Button>
      </div>
    </div>
  );
};