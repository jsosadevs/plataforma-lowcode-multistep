import React from 'react';
import { Flow, FlowStep, ViewMode, FieldLayout, SpacingSize } from '../../types/flow';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { LayoutGrid, Sliders, List, Square, Grid3X3, Smartphone, Circle, Zap } from 'lucide-react';

interface StepConfigTabProps {
  flow: Flow;
  selectedStep: string | null;
  onStepSelect: (stepId: string) => void;
  onUpdate: (config: any) => void;
}

export const StepConfigTab: React.FC<StepConfigTabProps> = ({
  flow,
  selectedStep,
  onStepSelect,
  onUpdate
}) => {
  const selectedStepData = flow.steps.find(step => step.id === selectedStep);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="mb-2">Step Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Configure the appearance of individual steps.
          </p>
        </div>

        <Select value={selectedStep || ''} onValueChange={onStepSelect}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select a step" />
          </SelectTrigger>
          <SelectContent>
            {flow.steps.map((step, index) => (
              <SelectItem key={step.id} value={step.id}>
                Step {index + 1}: {step.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedStepData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* View Mode */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <LayoutGrid className="w-4 h-4" />
                View Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Display Style</Label>
                <Select
                  value={selectedStepData.uiConfig?.viewMode || 'default'}
                  onValueChange={(value) => onUpdate({ viewMode: value as ViewMode })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">
                      <div className="flex items-center gap-2">
                        <List className="w-3 h-3" />
                        Default
                      </div>
                    </SelectItem>
                    <SelectItem value="cards">
                      <div className="flex items-center gap-2">
                        <Square className="w-3 h-3" />
                        Cards
                      </div>
                    </SelectItem>
                    <SelectItem value="grid">
                      <div className="flex items-center gap-2">
                        <Grid3X3 className="w-3 h-3" />
                        Grid
                      </div>
                    </SelectItem>
                    <SelectItem value="compact">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-3 h-3" />
                        Compact
                      </div>
                    </SelectItem>
                    <SelectItem value="minimal">
                      <div className="flex items-center gap-2">
                        <Circle className="w-3 h-3" />
                        Minimal
                      </div>
                    </SelectItem>
                    <SelectItem value="wizard">
                      <div className="flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        Wizard
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Field Layout</Label>
                <Select
                  value={selectedStepData.uiConfig?.fieldLayout || 'single'}
                  onValueChange={(value) => onUpdate({ fieldLayout: value as FieldLayout })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Column</SelectItem>
                    <SelectItem value="two-column">Two Columns</SelectItem>
                    <SelectItem value="three-column">Three Columns</SelectItem>
                    <SelectItem value="auto">Auto Layout</SelectItem>
                    <SelectItem value="inline">Inline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(selectedStepData.uiConfig?.viewMode === 'grid' || selectedStepData.uiConfig?.fieldLayout === 'auto') && (
                <div className="space-y-2">
                  <Label>Columns</Label>
                  <Select
                    value={selectedStepData.uiConfig?.columns?.toString() || '2'}
                    onValueChange={(value) => onUpdate({ columns: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Column</SelectItem>
                      <SelectItem value="2">2 Columns</SelectItem>
                      <SelectItem value="3">3 Columns</SelectItem>
                      <SelectItem value="4">4 Columns</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Spacing & Animation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Spacing & Animation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Spacing</Label>
                <Select
                  value={selectedStepData.uiConfig?.spacing || 'md'}
                  onValueChange={(value) => onUpdate({ spacing: value as SpacingSize })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xs">Extra Small</SelectItem>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                    <SelectItem value="xl">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Animation</Label>
                <Select
                  value={selectedStepData.uiConfig?.animation || 'none'}
                  onValueChange={(value) => onUpdate({ animation: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="fade">Fade</SelectItem>
                    <SelectItem value="slide">Slide</SelectItem>
                    <SelectItem value="scale">Scale</SelectItem>
                    <SelectItem value="bounce">Bounce</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
