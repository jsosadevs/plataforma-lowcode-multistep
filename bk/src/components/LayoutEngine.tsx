import React from 'react';
import { LayoutArea } from '../types/flow';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './ui/resizable';
import { ScrollArea } from './ui/scroll-area';
import { cn } from './ui/utils';

interface LayoutEngineProps {
  areas: LayoutArea[];
  children: {
    sidebar?: React.ReactNode;
    main?: React.ReactNode;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    navigation?: React.ReactNode;
    toolbar?: React.ReactNode;
  };
  className?: string;
  uiConfig?: {
    accentColor?: string;
    primaryColor?: string;
    sidebarBackground?: string;
    sidebarBorder?: string;
    mainBackground?: string;
    mainBorderRadius?: string;
  };
}

export const LayoutEngine: React.FC<LayoutEngineProps> = ({
  areas,
  children,
  className,
  uiConfig
}) => {
  // Filter and sort visible areas
  const visibleAreas = areas
    .filter(area => area.visible)
    .sort((a, b) => a.order - b.order);

  // Group areas by position for layout organization
  const groupedAreas = {
    top: visibleAreas.filter(area => area.position === 'top'),
    left: visibleAreas.filter(area => area.position === 'left'),
    center: visibleAreas.filter(area => area.position === 'center'),
    right: visibleAreas.filter(area => area.position === 'right'),
    bottom: visibleAreas.filter(area => area.position === 'bottom')
  };

  const getAreaContent = (area: LayoutArea) => {
    const contentMap = {
      sidebar: children.sidebar,
      main: children.main,
      header: children.header,
      footer: children.footer,
      navigation: children.navigation,
      toolbar: children.toolbar
    };

    return contentMap[area.component] || children.main;
  };

  const renderArea = (area: LayoutArea, index: number) => {
    const content = getAreaContent(area);
    
    // Apply custom styling based on component type and uiConfig
    const getAreaStyles = () => {
      const baseStyles: React.CSSProperties = {
        ...(area.sizeUnit === 'pixels' && { 
          [area.position === 'top' || area.position === 'bottom' ? 'height' : 'width']: `${area.size}px` 
        })
      };

      if (area.component === 'sidebar' && uiConfig?.sidebarBackground) {
        baseStyles.background = uiConfig.sidebarBackground;
        if (uiConfig.sidebarBorder) {
          const borderSide = area.position === 'left' ? 'borderRight' : 'borderLeft';
          baseStyles[borderSide] = `1px solid ${uiConfig.sidebarBorder}`;
        }
      } else if (area.component === 'main' && uiConfig?.mainBackground) {
        baseStyles.background = uiConfig.mainBackground;
      }

      return baseStyles;
    };
    
    return (
      <div
        key={area.id}
        className={cn(
          "flex flex-col min-h-0",
          area.component === 'sidebar' && !uiConfig?.sidebarBackground && "bg-muted/10",
          area.component === 'header' && "border-b bg-background",
          area.component === 'footer' && "border-t bg-background"
        )}
        style={getAreaStyles()}
      >
        {area.component === 'sidebar' || area.component === 'main' ? (
          <ScrollArea className="flex-1">
            {content}
          </ScrollArea>
        ) : (
          content
        )}
      </div>
    );
  };

  const renderHorizontalGroup = (areas: LayoutArea[]) => {
    if (areas.length === 0) return null;
    if (areas.length === 1) return renderArea(areas[0], 0);

    const resizableAreas = areas.filter(area => area.resizable);
    
    if (resizableAreas.length === 0) {
      // No resizable areas, use flex layout
      return (
        <div className="flex flex-1 min-h-0">
          {areas.map((area, index) => (
            <div
              key={area.id}
              className="flex-1"
              style={{ 
                flexBasis: `${area.size}%`,
                flexGrow: area.position === 'center' ? 1 : 0,
                flexShrink: area.position === 'center' ? 1 : 0
              }}
            >
              {renderArea(area, index)}
            </div>
          ))}
        </div>
      );
    }

    // Use ResizablePanelGroup for resizable areas
    return (
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {areas.map((area, index) => (
          <React.Fragment key={area.id}>
            <ResizablePanel
              defaultSize={area.size}
              minSize={area.minSize}
              maxSize={area.maxSize}
              collapsible={area.collapsible}
            >
              {renderArea(area, index)}
            </ResizablePanel>
            {index < areas.length - 1 && area.resizable && (
              <ResizableHandle withHandle />
            )}
          </React.Fragment>
        ))}
      </ResizablePanelGroup>
    );
  };

  const renderVerticalGroup = (topAreas: LayoutArea[], mainContent: React.ReactNode, bottomAreas: LayoutArea[]) => {
    const allVerticalAreas = [...topAreas, ...(mainContent ? [{ id: 'main-group', size: 0, resizable: true }] : []), ...bottomAreas];
    const hasResizable = allVerticalAreas.some(area => typeof area === 'object' && area.resizable);

    if (!hasResizable) {
      return (
        <div className="flex flex-col h-full">
          {topAreas.map(renderArea)}
          {mainContent && <div className="flex-1 min-h-0">{mainContent}</div>}
          {bottomAreas.map(renderArea)}
        </div>
      );
    }

    return (
      <ResizablePanelGroup direction="vertical" className="h-full">
        {topAreas.map((area, index) => (
          <React.Fragment key={area.id}>
            <ResizablePanel
              defaultSize={area.size}
              minSize={area.minSize}
              maxSize={area.maxSize}
              collapsible={area.collapsible}
            >
              {renderArea(area, index)}
            </ResizablePanel>
            {area.resizable && <ResizableHandle withHandle />}
          </React.Fragment>
        ))}
        
        {mainContent && (
          <>
            <ResizablePanel defaultSize={100 - topAreas.reduce((sum, area) => sum + area.size, 0) - bottomAreas.reduce((sum, area) => sum + area.size, 0)}>
              <div className="h-full">{mainContent}</div>
            </ResizablePanel>
            {bottomAreas.length > 0 && <ResizableHandle withHandle />}
          </>
        )}
        
        {bottomAreas.map((area, index) => (
          <React.Fragment key={area.id}>
            {index === 0 && !mainContent && <ResizableHandle withHandle />}
            <ResizablePanel
              defaultSize={area.size}
              minSize={area.minSize}
              maxSize={area.maxSize}
              collapsible={area.collapsible}
            >
              {renderArea(area, index)}
            </ResizablePanel>
            {index < bottomAreas.length - 1 && area.resizable && <ResizableHandle withHandle />}
          </React.Fragment>
        ))}
      </ResizablePanelGroup>
    );
  };

  // Main layout logic
  const horizontalAreas = [...groupedAreas.left, ...groupedAreas.center, ...groupedAreas.right];
  const hasVerticalAreas = groupedAreas.top.length > 0 || groupedAreas.bottom.length > 0;

  const mainHorizontalContent = horizontalAreas.length > 0 ? 
    renderHorizontalGroup(horizontalAreas) : 
    children.main;

  if (!hasVerticalAreas) {
    return (
      <div className={cn("h-full w-full", className)}>
        {mainHorizontalContent}
      </div>
    );
  }

  return (
    <div className={cn("h-full w-full", className)}>
      {renderVerticalGroup(groupedAreas.top, mainHorizontalContent, groupedAreas.bottom)}
    </div>
  );
};