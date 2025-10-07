import React from 'react';
import { useFlowService } from '../hooks/useFlowService';
import { useUIDesigner } from '../hooks/useUIDesigner';
import { useTemplateManager } from '../hooks/useTemplateManager';
import { useResponsiveLayoutConfig } from '../hooks/useResponsiveLayout';
import { 
  FullscreenDialog as Dialog, 
  FullscreenDialogContent as DialogContent, 
  FullscreenDialogTitle as DialogTitle, 
  FullscreenDialogDescription as DialogDescription, 
  FullscreenDialogHeader as DialogHeader 
} from './ui/fullscreen-dialog';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './ui/resizable';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Save, RotateCcw, Eye } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { FlowRunnerModal } from './FlowRunnerModal';
import { UIPreviewPane } from './UIPreviewPane';
import { FieldReorderTool } from './FieldReorderTool';
import { LayoutCustomizer } from './LayoutCustomizer';
import { TemplatesTab } from './ui-designer/TemplatesTab';
import { FlowConfigTab } from './ui-designer/FlowConfigTab';
import { StepConfigTab } from './ui-designer/StepConfigTab';
import { Flow, FlowUIConfig } from '../types/flow';

interface FlowUIDesignerProps {
  flowId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (flowId: string, uiConfig: FlowUIConfig) => void;
}

/**
 * Refactored UI Designer Component
 * Separates concerns into hooks, tabs, and preview
 */
export const FlowUIDesignerRefactored: React.FC<FlowUIDesignerProps> = ({
  flowId,
  isOpen,
  onClose,
  onSave
}) => {
  const { getFlow, updateFlow } = useFlowService();
  const flow = flowId ? getFlow(flowId) : null;
  
  const { state, actions } = useUIDesigner(flow, isOpen);
  const { templates, applyTemplate, getTemplatesByCategory } = useTemplateManager();
  const { responsive, modalConfig, shouldShowElement, titleClasses, tabLayout } = useResponsiveLayoutConfig();
  
  const [previewFlow, setPreviewFlow] = React.useState<string | null>(null);

  // Get selected step data
  const selectedStepData = state.localFlow?.steps.find(
    step => step.id === state.selectedStep
  );

  // Handle template selection
  const handleTemplateSelect = (template: any) => {
    if (!state.localFlow || !flowId) return;

    const updatedFlow = applyTemplate(
      template,
      state.localFlow,
      flowId,
      (flow, config) => {
        updateFlow(flow);
        onSave?.(flowId, config);
      }
    );

    if (updatedFlow) {
      // Update local state with the new flow
      actions.updateFlowUIConfig(updatedFlow.uiConfig || {});
      actions.setLayoutPreset(updatedFlow.uiConfig?.layout?.preset || 'sidebar-left');
    }
  };

  // Handle save
  const handleSave = () => {
    if (!state.localFlow || !flowId) return;

    updateFlow(state.localFlow);
    onSave?.(flowId, state.localFlow.uiConfig || {});
    actions.markDirty();
    
    toast.success('Changes Saved', {
      description: 'All UI configuration changes have been saved successfully.'
    });
  };

  // Handle reset
  const handleReset = () => {
    actions.resetChanges();
    toast.info('Changes Reset', {
      description: 'All unsaved changes have been reset.'
    });
  };

  // Handle preview
  const handlePreview = () => {
    if (!state.localFlow) return;
    updateFlow(state.localFlow);
    setPreviewFlow(state.localFlow.id);
  };

  // Handle layout preset change
  const handleLayoutPresetChange = (preset: any) => {
    actions.setLayoutPreset(preset.id);
    actions.updateFlowUIConfig({
      layout: {
        ...state.localFlow?.uiConfig?.layout,
        preset: preset.id,
        areas: preset.areas || []
      }
    });
  };

  // Handle layout areas change
  const handleLayoutAreasChange = (areas: any[]) => {
    actions.updateFlowUIConfig({
      layout: {
        ...state.localFlow?.uiConfig?.layout,
        areas,
        customLayout: true
      }
    });
  };

  if (!flow || !isOpen || !state.localFlow) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>UI Designer</DialogTitle>
            <DialogDescription>Design the user interface for your flow</DialogDescription>
          </DialogHeader>

          {/* Main Layout */}
          <div className="h-full w-full flex flex-col">
            {/* Header Bar */}
            <div className={`border-b flex items-center justify-between bg-background shrink-0 ${
              responsive.isMobile ? 'h-14 px-4' : 'h-16 px-6'
            }`}>
              <div className="min-w-0 flex-1">
                <h2 className={responsive.isMobile ? 'text-lg' : 'text-xl'}>UI Designer</h2>
                <div className={`text-muted-foreground flex items-center gap-2 ${
                  responsive.isMobile ? 'text-xs' : 'text-sm'
                }`}>
                  <span className="truncate">{flow.name}</span>
                  {state.isDirty && (
                    <Badge variant="outline" className={responsive.isMobile ? 'text-xs px-1.5 py-0.5' : 'ml-2'}>
                      {responsive.isMobile ? 'Unsaved' : 'Unsaved Changes'}
                    </Badge>
                  )}
                </div>
              </div>
              <div className={`flex items-center shrink-0 ${responsive.isMobile ? 'gap-1' : 'gap-2'}`}>
                {!responsive.isMobile && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreview}
                      disabled={!state.localFlow}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      disabled={!state.isDirty}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!state.isDirty}
                >
                  <Save className={responsive.isMobile ? 'w-3 h-3' : 'w-4 h-4 mr-2'} />
                  {!responsive.isMobile && 'Save Changes'}
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  {responsive.isMobile ? 'X' : 'Close'}
                </Button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0">
              <ResizablePanelGroup direction="horizontal" className="h-full">
                {/* Configuration Panel */}
                <ResizablePanel defaultSize={state.showPreviewPane ? 50 : 100} minSize={30}>
                  <ScrollArea className="h-full">
                    <div className={responsive.isMobile ? 'p-4' : 'p-6'}>
                      <Tabs
                        value={state.activeTab}
                        onValueChange={actions.setActiveTab}
                        className="w-full"
                      >
                        <TabsList className={`w-full mb-6 ${responsive.isMobile ? 'grid-cols-2 gap-1' : responsive.isTablet ? 'grid-cols-3 gap-2' : 'grid-cols-5 gap-0'} grid`}>
                          <TabsTrigger value="templates" className={responsive.isMobile ? 'text-xs px-2' : ''}>
                            {responsive.isMobile ? 'Temps' : 'Templates'}
                          </TabsTrigger>
                          <TabsTrigger value="flow" className={responsive.isMobile ? 'text-xs px-2' : ''}>
                            Flow
                          </TabsTrigger>
                          <TabsTrigger value="steps" className={responsive.isMobile ? 'text-xs px-2' : ''}>
                            Steps
                          </TabsTrigger>
                          <TabsTrigger value="fields" className={responsive.isMobile ? 'text-xs px-2' : ''}>
                            Fields
                          </TabsTrigger>
                          <TabsTrigger value="layout" className={responsive.isMobile ? 'text-xs px-2' : ''}>
                            Layout
                          </TabsTrigger>
                        </TabsList>

                        {/* Templates Tab */}
                        <TabsContent value="templates">
                          <TemplatesTab
                            templates={templates}
                            onTemplateSelect={handleTemplateSelect}
                          />
                        </TabsContent>

                        {/* Flow Config Tab */}
                        <TabsContent value="flow">
                          <FlowConfigTab
                            flow={state.localFlow}
                            onUpdate={actions.updateFlowUIConfig}
                          />
                        </TabsContent>

                        {/* Step Config Tab */}
                        <TabsContent value="steps">
                          <StepConfigTab
                            flow={state.localFlow}
                            selectedStep={state.selectedStep}
                            onStepSelect={actions.setSelectedStep}
                            onUpdate={(config) => {
                              if (state.selectedStep) {
                                actions.updateStepUIConfig(state.selectedStep, config);
                              }
                            }}
                          />
                        </TabsContent>

                        {/* Fields Tab */}
                        <TabsContent value="fields">
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="mb-2">Field Configuration</h3>
                                <p className="text-sm text-muted-foreground">
                                  Reorder fields and customize their appearance and behavior.
                                </p>
                              </div>
                            </div>

                            {selectedStepData && state.selectedStep ? (
                              <FieldReorderTool
                                fields={selectedStepData.formFields}
                                onReorder={(reorderedFields) =>
                                  actions.reorderStepFields(state.selectedStep!, reorderedFields)
                                }
                                onFieldUpdate={(fieldKey, updates) =>
                                  actions.updateFieldUIConfig(
                                    state.selectedStep!,
                                    fieldKey,
                                    updates.uiConfig || {}
                                  )
                                }
                              />
                            ) : (
                              <div className="text-center py-12 text-muted-foreground">
                                <p>Please select a step to configure fields</p>
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        {/* Layout Tab */}
                        <TabsContent value="layout">
                          <LayoutCustomizer
                            currentPreset={state.layoutPreset}
                            currentAreas={state.localFlow.uiConfig?.layout?.areas || []}
                            onPresetChange={handleLayoutPresetChange}
                            onAreasChange={handleLayoutAreasChange}
                            onReset={handleReset}
                          />
                        </TabsContent>
                      </Tabs>
                    </div>
                  </ScrollArea>
                </ResizablePanel>

                {/* Preview Panel - Hidden on mobile */}
                {state.showPreviewPane && !responsive.isMobile && (
                  <>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={50} minSize={30}>
                      <div className="h-full bg-muted/10">
                        <div className="h-full flex flex-col">
                          <div className={`border-b bg-background flex items-center justify-between shrink-0 ${
                            responsive.isTablet ? 'h-10 px-3' : 'h-12 px-4'
                          }`}>
                            <h3 className={responsive.isTablet ? 'text-xs' : 'text-sm'}>Preview</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => actions.setShowPreviewPane(false)}
                            >
                              {responsive.isTablet ? 'Hide' : 'Hide Preview'}
                            </Button>
                          </div>
                          <ScrollArea className="flex-1">
                            <div className={responsive.isTablet ? 'p-4' : 'p-6'}>
                              <UIPreviewPane
                                flow={state.localFlow}
                                selectedStep={selectedStepData}
                                deviceMode={state.deviceMode}
                                onDeviceModeChange={actions.setDeviceMode}
                              />
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    </ResizablePanel>
                  </>
                )}

                {/* Show Preview Button when hidden - Desktop/Tablet only */}
                {!state.showPreviewPane && !responsive.isMobile && (
                  <div className={`absolute z-10 ${
                    responsive.isTablet ? 'top-16 right-2' : 'top-20 right-4'
                  }`}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => actions.setShowPreviewPane(true)}
                    >
                      <Eye className={`${responsive.isTablet ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-2'}`} />
                      {responsive.isTablet ? 'Preview' : 'Show Preview'}
                    </Button>
                  </div>
                )}

                {/* Mobile Preview Action - Add to header on mobile */}
                {responsive.isMobile && (
                  <div className="absolute top-16 right-4 z-10">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreview}
                      disabled={!state.localFlow}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Preview
                    </Button>
                  </div>
                )}
              </ResizablePanelGroup>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <FlowRunnerModal
        flowId={previewFlow}
        isOpen={!!previewFlow}
        onClose={() => setPreviewFlow(null)}
        onComplete={() => { }}
        enableDesignMode={true}
      />
    </>
  );
};
