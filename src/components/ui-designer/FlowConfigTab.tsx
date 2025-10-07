import React from 'react';
import { Flow, ColorTheme } from '../../types/flow';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Monitor, Layout } from 'lucide-react';

interface FlowConfigTabProps {
  flow: Flow;
  onUpdate: (config: any) => void;
}

export const FlowConfigTab: React.FC<FlowConfigTabProps> = ({
  flow,
  onUpdate
}) => {
  const uiConfig = flow.uiConfig || {};

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2">Flow Configuration</h3>
        <p className="text-sm text-muted-foreground">
          Configure the overall appearance and behavior of the flow modal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Modal Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Modal Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Modal Size</Label>
              <Select
                value={uiConfig.modalSize || 'lg'}
                onValueChange={(value) => onUpdate({ modalSize: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sm">Small</SelectItem>
                  <SelectItem value="md">Medium</SelectItem>
                  <SelectItem value="lg">Large</SelectItem>
                  <SelectItem value="xl">Extra Large</SelectItem>
                  <SelectItem value="full">Full Screen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={uiConfig.theme || 'default'}
                onValueChange={(value) => onUpdate({ theme: value as ColorTheme })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="danger">Danger</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Animation Speed</Label>
              <Select
                value={uiConfig.animation || 'smooth'}
                onValueChange={(value) => onUpdate({ animation: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="fast">Fast</SelectItem>
                  <SelectItem value="smooth">Smooth</SelectItem>
                  <SelectItem value="slow">Slow</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Layout Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Layout className="w-4 h-4" />
              Layout Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Show Sidebar</Label>
              <Switch
                checked={uiConfig.showSidebar !== false}
                onCheckedChange={(checked) => onUpdate({ showSidebar: checked })}
              />
            </div>

            {uiConfig.showSidebar !== false && (
              <div className="space-y-2">
                <Label>Sidebar Position</Label>
                <Select
                  value={uiConfig.sidebarPosition || 'left'}
                  onValueChange={(value) => onUpdate({ sidebarPosition: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Progress Style</Label>
              <Select
                value={uiConfig.progressStyle || 'bar'}
                onValueChange={(value) => onUpdate({ progressStyle: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Progress Bar</SelectItem>
                  <SelectItem value="dots">Dots</SelectItem>
                  <SelectItem value="steps">Step Indicators</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Header Style</Label>
              <Select
                value={uiConfig.headerStyle || 'default'}
                onValueChange={(value) => onUpdate({ headerStyle: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
