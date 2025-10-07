import React, { ReactNode } from 'react';
import { useResponsiveLayoutConfig } from '../hooks/useResponsiveLayout';
import { cn } from './ui/utils';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Menu, X } from 'lucide-react';

interface ResponsiveLayoutWrapperProps {
  children: {
    sidebar?: ReactNode;
    main: ReactNode;
    header?: ReactNode;
    footer?: ReactNode;
    details?: ReactNode;
    customInfo?: ReactNode;
  };
  title?: string;
  description?: string;
  onClose?: () => void;
  className?: string;
  enableDesignMode?: boolean;
  useHorizontalLayout?: boolean;
  showDetailPanel?: boolean;
  showCustomInfoArea?: boolean;
}

export const ResponsiveLayoutWrapper: React.FC<ResponsiveLayoutWrapperProps> = ({
  children,
  title,
  description,
  onClose,
  className,
  enableDesignMode = false,
  useHorizontalLayout = false,
  showDetailPanel = false,
  showCustomInfoArea = false
}) => {
  const { responsive, modalConfig, sidebarWidth, headerHeight, shouldUseOverlay, titleClasses, descriptionClasses } = useResponsiveLayoutConfig();
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  // Render mobile-optimized header
  const MobileHeader = () => (
    <div className={cn("flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur-sm", headerHeight)}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {children.sidebar && shouldUseOverlay && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileSidebarOpen(true)}
            className="shrink-0"
          >
            <Menu className="w-4 h-4" />
          </Button>
        )}
        <div className="min-w-0 flex-1">
          {title && (
            <h1 className={titleClasses}>{title}</h1>
          )}
          {description && responsive.isTablet && (
            <p className={descriptionClasses}>{description}</p>
          )}
        </div>
      </div>
      {onClose && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="shrink-0"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );

  // Render desktop header
  const DesktopHeader = () => (
    <div className={cn("flex items-center justify-between px-6 py-4 border-b bg-background", headerHeight)}>
      <div className="min-w-0 flex-1">
        {title && (
          <h1 className={titleClasses}>{title}</h1>
        )}
        {description && (
          <p className={descriptionClasses}>{description}</p>
        )}
      </div>
      {onClose && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );

  // Render sidebar content with responsive wrapper
  const SidebarContent = () => {
    if (!children.sidebar) return null;

    if (shouldUseOverlay) {
      return (
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className={cn("p-0", sidebarWidth)}>
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            {children.sidebar}
          </SheetContent>
        </Sheet>
      );
    }

    return (
      <div className={cn("border-r bg-muted/20 flex-shrink-0", sidebarWidth)}>
        {children.sidebar}
      </div>
    );
  };

  // Render main content with responsive padding and optional details panel
  const MainContent = () => {
    const contentPadding = responsive.isMobile ? 'p-4' : responsive.isTablet ? 'p-6' : 'p-8';
    
    // For horizontal layout, content is handled by the main component itself
    if (useHorizontalLayout) {
      return (
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <div className="flex-1 overflow-hidden">
            {children.main}
          </div>
          {children.footer && (
            <div className="border-t bg-background p-4">
              {children.footer}
            </div>
          )}
        </div>
      );
    }

    // Traditional layout with optional details panel
    return (
      <div className="flex-1 flex min-w-0 min-h-0">
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <div className={cn("flex-1 overflow-auto", contentPadding)}>
            {children.main}
          </div>
          {children.footer && (
            <div className="border-t bg-background p-4">
              {children.footer}
            </div>
          )}
        </div>
        
        {/* Details panel for desktop layouts */}
        {children.details && showDetailPanel && !responsive.isMobile && !useHorizontalLayout && (
          <div className="w-80 flex-shrink-0 border-l bg-muted/20">
            <div className="h-full overflow-auto p-4">
              {children.details}
            </div>
          </div>
        )}
        
        {/* Custom Info Area panel for desktop layouts */}
        {children.customInfo && showCustomInfoArea && !responsive.isMobile && !useHorizontalLayout && (
          <div className="w-80 flex-shrink-0 border-l bg-gradient-to-b from-primary/5 to-background">
            <div className="h-full overflow-auto p-4">
              {children.customInfo}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("h-full w-full flex flex-col", className)}>
      {/* Header */}
      {(title || description || onClose) && (
        <div className="shrink-0">
          {responsive.isMobile ? <MobileHeader /> : <DesktopHeader />}
        </div>
      )}

      {/* Custom header if provided */}
      {children.header && (
        <div className="shrink-0">
          {children.header}
        </div>
      )}

      {/* Main layout */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar for non-overlay modes and non-horizontal layouts */}
        {!shouldUseOverlay && !useHorizontalLayout && <SidebarContent />}
        
        {/* Main content */}
        <MainContent />
      </div>

      {/* Mobile sidebar overlay */}
      {shouldUseOverlay && <SidebarContent />}
    </div>
  );
};

// Hook para simplificar el uso del wrapper responsivo
export const useResponsiveModalLayout = () => {
  const { responsive, modalConfig } = useResponsiveLayoutConfig();

  const getModalClasses = (customClasses?: string) => {
    return cn(
      "!fixed !p-0 !gap-0 overflow-hidden",
      modalConfig.className,
      customClasses
    );
  };

  const getContentClasses = (fieldCount: number = 0) => {
    const { fieldLayoutColumns } = useResponsiveLayoutConfig();
    const columns = Math.min(fieldLayoutColumns, Math.ceil(fieldCount / 3));
    
    if (responsive.isMobile) {
      return "space-y-4";
    }
    
    if (responsive.isTablet) {
      return columns > 1 ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4";
    }
    
    return columns === 3 ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" :
           columns === 2 ? "grid grid-cols-1 md:grid-cols-2 gap-6" :
           "space-y-6";
  };

  const getTabsClasses = () => {
    const { tabLayout } = useResponsiveLayoutConfig();
    return tabLayout;
  };

  const shouldShowElement = (element: 'sidebar' | 'description' | 'badges') => {
    switch (element) {
      case 'sidebar':
        return !responsive.isMobile;
      case 'description':
        return !responsive.isMobile || responsive.orientation === 'landscape';
      case 'badges':
        return responsive.isTablet || responsive.isDesktop || responsive.isWide;
      default:
        return true;
    }
  };

  return {
    responsive,
    modalConfig,
    getModalClasses,
    getContentClasses,
    getTabsClasses,
    shouldShowElement
  };
};