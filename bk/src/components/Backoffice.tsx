import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { FlowDesigner } from './FlowDesigner';
import { FlowDesignerDnD } from './FlowDesignerDnD';
import { FlowUIDesignerRefactored } from './FlowUIDesignerRefactored';
import { QueryDesigner } from './QueryDesigner';
import { GroupManager } from './GroupManager';
import { FlowGroupManager } from './FlowGroupManager';
import { Workflow, Database, FolderTree, Layers, Palette } from 'lucide-react';

interface BackofficeProps {
  onPreviewFlow?: (flowId: string) => void;
}

export const Backoffice: React.FC<BackofficeProps> = ({ onPreviewFlow }) => {
  const [activeTab, setActiveTab] = useState('groups');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedFlow, setSelectedFlow] = useState('');
  const [uiDesignerFlowId, setUiDesignerFlowId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2>Backoffice</h2>
        <p className="text-muted-foreground mt-2">
          Design and manage your flows and queries from this centralized administration panel.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-3xl grid-cols-5">
          <TabsTrigger value="groups" className="flex items-center space-x-2">
            <FolderTree className="w-4 h-4" />
            <span>Groups</span>
          </TabsTrigger>
          <TabsTrigger value="flows" className="flex items-center space-x-2">
            <Workflow className="w-4 h-4" />
            <span>Flows</span>
          </TabsTrigger>
          <TabsTrigger value="designer" className="flex items-center space-x-2">
            <Layers className="w-4 h-4" />
            <span>Designer</span>
          </TabsTrigger>
          <TabsTrigger value="ui" className="flex items-center space-x-2">
            <Palette className="w-4 h-4" />
            <span>UI Designer</span>
          </TabsTrigger>
          <TabsTrigger value="queries" className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>Queries</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="space-y-6">
          <GroupManager 
            onGroupSelect={setSelectedGroup}
            selectedGroup={selectedGroup}
          />
        </TabsContent>

        <TabsContent value="flows" className="space-y-6">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3">
              <GroupManager 
                compact
                onGroupSelect={setSelectedGroup}
                selectedGroup={selectedGroup}
              />
            </div>
            <div className="col-span-9">
              {selectedGroup ? (
                <FlowGroupManager
                  selectedGroup={selectedGroup}
                  onFlowSelect={setSelectedFlow}
                  onPreviewFlow={onPreviewFlow}
                  selectedFlow={selectedFlow}
                />
              ) : (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <div className="text-center">
                    <FolderTree className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a group from the sidebar to manage flows</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="designer" className="space-y-6">
          <FlowDesignerDnD onPreviewFlow={onPreviewFlow} />
        </TabsContent>

        <TabsContent value="ui" className="space-y-6">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3">
              <GroupManager 
                compact
                onGroupSelect={setSelectedGroup}
                selectedGroup={selectedGroup}
              />
            </div>
            <div className="col-span-9">
              {selectedGroup ? (
                <FlowGroupManager
                  selectedGroup={selectedGroup}
                  onFlowSelect={setSelectedFlow}
                  onPreviewFlow={onPreviewFlow}
                  selectedFlow={selectedFlow}
                  onOpenUIDesigner={setUiDesignerFlowId}
                  showUIDesignerAction={true}
                />
              ) : (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <div className="text-center">
                    <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a group from the sidebar to customize flow UIs</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="queries" className="space-y-6">
          <QueryDesigner />
        </TabsContent>
      </Tabs>

      {/* UI Designer Modal */}
      <FlowUIDesignerRefactored
        flowId={uiDesignerFlowId}
        isOpen={!!uiDesignerFlowId}
        onClose={() => setUiDesignerFlowId(null)}
        onSave={(flowId, uiConfig) => {
          console.log('UI Config saved for flow:', flowId, uiConfig);
        }}
      />
    </div>
  );
};
