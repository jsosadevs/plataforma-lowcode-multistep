import React, { useState, useMemo, useEffect } from 'react';
import { LayoutArea, LayoutPreset } from '../types/flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Layout, Sidebar, PanelLeftOpen, PanelRightOpen, Monitor, Maximize, 
  Grid3X3, Columns, Rows, LayoutGrid, SplitSquareHorizontal, 
  SplitSquareVertical, Move, Settings, Eye, RotateCcw,
  ChevronUp, ChevronDown, GripVertical
} from 'lucide-react';

interface LayoutCustomizerProps {
  currentPreset?: string;
  currentAreas?: LayoutArea[];
  onPresetChange?: (preset: LayoutPreset) => void;
  onAreasChange?: (areas: LayoutArea[]) => void;
  onReset?: () => void;
}

const DEFAULT_PRESETS: LayoutPreset[] = [
  {
    id: 'sidebar-left',
    name: 'Sidebar Left',
    description: 'Classic layout with left sidebar for navigation',
    icon: 'PanelLeftOpen',
    category: 'classic',
    modalSize: 'full',
    fullscreen: false,
    responsive: true,
    areas: [
      {
        id: 'sidebar-left',
        name: 'Left Sidebar',
        component: 'sidebar',
        visible: true,
        position: 'left',
        size: 25,
        sizeUnit: 'percentage',
        order: 1,
        collapsible: true,
        resizable: true,
        minSize: 20,
        maxSize: 40,
        content: 'progress'
      },
      {
        id: 'main-content',
        name: 'Main Content',
        component: 'main',
        visible: true,
        position: 'center',
        size: 75,
        sizeUnit: 'percentage',
        order: 2,
        resizable: false,
        content: 'form'
      }
    ]
  },
  {
    id: 'sidebar-right',
    name: 'Sidebar Right',
    description: 'Modern layout with right sidebar for preview',
    icon: 'PanelRightOpen',
    category: 'modern',
    modalSize: 'full',
    fullscreen: false,
    responsive: true,
    areas: [
      {
        id: 'main-content',
        name: 'Main Content',
        component: 'main',
        visible: true,
        position: 'center',
        size: 65,
        sizeUnit: 'percentage',
        order: 1,
        resizable: false,
        content: 'form'
      },
      {
        id: 'sidebar-right',
        name: 'Right Sidebar',
        component: 'sidebar',
        visible: true,
        position: 'right',
        size: 35,
        sizeUnit: 'percentage',
        order: 2,
        collapsible: true,
        resizable: true,
        minSize: 25,
        maxSize: 50,
        content: 'preview'
      }
    ]
  },
  {
    id: 'full-width',
    name: 'Full Width',
    description: 'Minimal layout without sidebars',
    icon: 'Monitor',
    category: 'minimal',
    modalSize: 'lg',
    fullscreen: false,
    responsive: true,
    areas: [
      {
        id: 'main-content',
        name: 'Main Content',
        component: 'main',
        visible: true,
        position: 'center',
        size: 100,
        sizeUnit: 'percentage',
        order: 1,
        resizable: false,
        content: 'form'
      }
    ]
  },
  {
    id: 'three-panel',
    name: 'Three Panel',
    description: 'Advanced layout with dual sidebars',
    icon: 'Columns',
    category: 'advanced',
    modalSize: 'full',
    fullscreen: true,
    responsive: true,
    areas: [
      {
        id: 'sidebar-left',
        name: 'Left Panel',
        component: 'sidebar',
        visible: true,
        position: 'left',
        size: 20,
        sizeUnit: 'percentage',
        order: 1,
        collapsible: true,
        resizable: true,
        minSize: 15,
        maxSize: 30,
        content: 'navigation'
      },
      {
        id: 'main-content',
        name: 'Center Panel',
        component: 'main',
        visible: true,
        position: 'center',
        size: 50,
        sizeUnit: 'percentage',
        order: 2,
        resizable: false,
        content: 'form'
      },
      {
        id: 'sidebar-right',
        name: 'Right Panel',
        component: 'sidebar',
        visible: true,
        position: 'right',
        size: 30,
        sizeUnit: 'percentage',
        order: 3,
        collapsible: true,
        resizable: true,
        minSize: 20,
        maxSize: 40,
        content: 'preview'
      }
    ]
  },
  {
    id: 'vertical-split',
    name: 'Vertical Split',
    description: 'Layout with horizontal header and footer',
    icon: 'Rows',
    category: 'modern',
    modalSize: 'full',
    fullscreen: false,
    responsive: true,
    areas: [
      {
        id: 'header',
        name: 'Header',
        component: 'header',
        visible: true,
        position: 'top',
        size: 15,
        sizeUnit: 'percentage',
        order: 1,
        collapsible: false,
        resizable: true,
        minSize: 10,
        maxSize: 25,
        content: 'navigation'
      },
      {
        id: 'main-content',
        name: 'Main Content',
        component: 'main',
        visible: true,
        position: 'center',
        size: 85,
        sizeUnit: 'percentage',
        order: 2,
        resizable: false,
        content: 'form'
      }
    ]
  },
  {
    id: 'wizard-mode',
    name: 'Wizard Mode',
    description: 'Step-by-step wizard interface',
    icon: 'LayoutGrid',
    category: 'classic',
    modalSize: 'lg',
    fullscreen: false,
    responsive: true,
    areas: [
      {
        id: 'header',
        name: 'Progress Header',
        component: 'header',
        visible: true,
        position: 'top',
        size: 12,
        sizeUnit: 'percentage',
        order: 1,
        collapsible: false,
        resizable: false,
        content: 'progress'
      },
      {
        id: 'main-content',
        name: 'Wizard Content',
        component: 'main',
        visible: true,
        position: 'center',
        size: 88,
        sizeUnit: 'percentage',
        order: 2,
        resizable: false,
        content: 'form'
      }
    ]
  }
];

const getIconComponent = (iconName: string) => {
  const icons = {
    PanelLeftOpen,
    PanelRightOpen,
    Monitor,
    Columns,
    Rows,
    LayoutGrid,
    Maximize,
    Grid3X3
  };
  return icons[iconName as keyof typeof icons] || Layout;
};

export const LayoutCustomizer: React.FC<LayoutCustomizerProps> = ({
  currentPreset,
  currentAreas = [],
  onPresetChange,
  onAreasChange,
  onReset
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>(currentPreset || 'sidebar-left');
  const [customAreas, setCustomAreas] = useState<LayoutArea[]>(currentAreas);
  const [activeAreaId, setActiveAreaId] = useState<string | null>(null);

  // Update local state when props change
  useEffect(() => {
    if (currentPreset && currentPreset !== selectedPreset) {
      setSelectedPreset(currentPreset);
    }
  }, [currentPreset, selectedPreset]);

  useEffect(() => {
    if (currentAreas && currentAreas.length > 0) {
      setCustomAreas(currentAreas);
    }
  }, [currentAreas]);

  // Get current preset data
  const currentPresetData = useMemo(() => {
    return DEFAULT_PRESETS.find(p => p.id === selectedPreset) || DEFAULT_PRESETS[0];
  }, [selectedPreset]);

  // Working areas (either from preset or custom)
  const workingAreas = useMemo(() => {
    return customAreas.length > 0 ? customAreas : currentPresetData.areas;
  }, [customAreas, currentPresetData]);

  const handlePresetSelect = (preset: LayoutPreset) => {
    setSelectedPreset(preset.id);
    setCustomAreas([]); // Reset custom areas when selecting preset
    onPresetChange?.(preset);
  };

  const handleAreaUpdate = (areaId: string, updates: Partial<LayoutArea>) => {
    const updatedAreas = workingAreas.map(area => 
      area.id === areaId ? { ...area, ...updates } : area
    );
    setCustomAreas(updatedAreas);
    onAreasChange?.(updatedAreas);
  };

  const handleAreaReorder = (areaId: string, direction: 'up' | 'down') => {
    const currentIndex = workingAreas.findIndex(area => area.id === areaId);
    if (currentIndex === -1) return;

    const newAreas = [...workingAreas];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex >= 0 && targetIndex < newAreas.length) {
      // Swap order values
      const temp = newAreas[currentIndex].order;
      newAreas[currentIndex].order = newAreas[targetIndex].order;
      newAreas[targetIndex].order = temp;
      
      // Sort by order
      newAreas.sort((a, b) => a.order - b.order);
      
      setCustomAreas(newAreas);
      onAreasChange?.(newAreas);
    }
  };

  const getPresetsByCategory = (category: string) => {
    return DEFAULT_PRESETS.filter(preset => preset.category === category);
  };

  const renderPresetCard = (preset: LayoutPreset) => {
    const IconComponent = getIconComponent(preset.icon);
    const isSelected = selectedPreset === preset.id;

    return (
      <Card 
        key={preset.id}
        className={`cursor-pointer transition-all hover:shadow-md ${
          isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
        }`}
        onClick={() => handlePresetSelect(preset)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-sm">{preset.name}</CardTitle>
              <Badge variant="outline" className="text-xs mt-1 capitalize">
                {preset.category}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <CardDescription className="text-xs">
            {preset.description}
          </CardDescription>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span>{preset.areas.length} areas</span>
            {preset.fullscreen && <Badge variant="secondary" className="text-xs">Fullscreen</Badge>}
            {preset.responsive && <Badge variant="outline" className="text-xs">Responsive</Badge>}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAreaEditor = (area: LayoutArea) => {
    const isActive = activeAreaId === area.id;

    return (
      <Card 
        key={area.id}
        className={`transition-all ${isActive ? 'ring-2 ring-primary' : ''}`}
      >
        <CardHeader className="pb-3 cursor-pointer" onClick={() => setActiveAreaId(isActive ? null : area.id)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                <Switch
                  checked={area.visible}
                  onCheckedChange={(checked) => handleAreaUpdate(area.id, { visible: checked })}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div>
                <CardTitle className="text-sm">{area.name}</CardTitle>
                <CardDescription className="text-xs capitalize">
                  {area.component} • {area.position} • {area.size}{area.sizeUnit === 'percentage' ? '%' : 'px'}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAreaReorder(area.id, 'up');
                }}
              >
                <ChevronUp className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAreaReorder(area.id, 'down');
                }}
              >
                <ChevronDown className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {isActive && (
          <CardContent className="pt-0 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Position</Label>
                <Select
                  value={area.position}
                  onValueChange={(value) => handleAreaUpdate(area.id, { position: value as any })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Content Type</Label>
                <Select
                  value={area.content || 'custom'}
                  onValueChange={(value) => handleAreaUpdate(area.id, { content: value as any })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="steps">Steps</SelectItem>
                    <SelectItem value="navigation">Navigation</SelectItem>
                    <SelectItem value="form">Form</SelectItem>
                    <SelectItem value="preview">Preview</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Size: {area.size}{area.sizeUnit === 'percentage' ? '%' : 'px'}</Label>
              <Slider
                value={[area.size]}
                onValueChange={([value]) => handleAreaUpdate(area.id, { size: value })}
                min={area.minSize || 10}
                max={area.maxSize || 100}
                step={1}
                className="w-full"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id={`collapsible-${area.id}`}
                  checked={area.collapsible || false}
                  onCheckedChange={(checked) => handleAreaUpdate(area.id, { collapsible: checked })}
                />
                <Label htmlFor={`collapsible-${area.id}`} className="text-xs">Collapsible</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id={`resizable-${area.id}`}
                  checked={area.resizable || false}
                  onCheckedChange={(checked) => handleAreaUpdate(area.id, { resizable: checked })}
                />
                <Label htmlFor={`resizable-${area.id}`} className="text-xs">Resizable</Label>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Layout className="w-4 h-4" />
            Layout Configuration
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a preset or customize your modal layout
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <Tabs defaultValue="presets" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="presets">Layout Presets</TabsTrigger>
          <TabsTrigger value="custom">Custom Areas</TabsTrigger>
        </TabsList>

        <TabsContent value="presets" className="space-y-4">
          <div className="space-y-4">
            {['classic', 'modern', 'minimal', 'advanced'].map(category => (
              <div key={category} className="space-y-3">
                <h4 className="text-sm font-medium capitalize">{category} Layouts</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getPresetsByCategory(category).map(renderPresetCard)}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Layout Areas</h4>
              <Badge variant="outline">
                {workingAreas.filter(area => area.visible).length} visible areas
              </Badge>
            </div>
            
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                {workingAreas
                  .sort((a, b) => a.order - b.order)
                  .map(renderAreaEditor)}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};