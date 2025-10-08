import { useState, useEffect } from 'react';

type BreakpointType = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type ScreenType = 'mobile' | 'tablet' | 'desktop' | 'wide';

interface ResponsiveState {
  breakpoint: BreakpointType;
  screenType: ScreenType;
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  orientation: 'portrait' | 'landscape';
}

const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

const getBreakpoint = (width: number): BreakpointType => {
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
};

const getScreenType = (width: number): ScreenType => {
  if (width >= breakpoints.xl) return 'wide';
  if (width >= breakpoints.lg) return 'desktop';
  if (width >= breakpoints.md) return 'tablet';
  return 'mobile';
};

export const useResponsiveLayout = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>(() => ({
    breakpoint: 'lg',
    screenType: 'desktop',
    width: 1024,
    height: 768,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isWide: false,
    orientation: 'landscape'
  }));

  useEffect(() => {
    const updateState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const breakpoint = getBreakpoint(width);
      const screenType = getScreenType(width);

      setState({
        breakpoint,
        screenType,
        width,
        height,
        isMobile: screenType === 'mobile',
        isTablet: screenType === 'tablet',
        isDesktop: screenType === 'desktop',
        isWide: screenType === 'wide',
        orientation: width > height ? 'landscape' : 'portrait'
      });
    };

    // Initial update
    updateState();

    // Set up resize listener
    window.addEventListener('resize', updateState);
    window.addEventListener('orientationchange', updateState);

    return () => {
      window.removeEventListener('resize', updateState);
      window.removeEventListener('orientationchange', updateState);
    };
  }, []);

  return state;
};

// Hook para obtener configuraciones de layout responsivas
export const useResponsiveLayoutConfig = () => {
  const responsive = useResponsiveLayout();

  const getModalConfig = () => {
    if (responsive.isMobile) {
      return {
        className: 'inset-0 w-full h-full max-w-full max-h-full rounded-none',
        showSidebar: false,
        sidebarMode: 'overlay',
        fieldLayout: 'single',
        spacing: 'sm',
        headerCompact: true,
        footerSticky: true
      };
    }

    if (responsive.isTablet) {
      return {
        className: 'inset-2 w-auto h-auto max-w-[calc(100vw-16px)] max-h-[calc(100vh-16px)] rounded-lg',
        showSidebar: true,
        sidebarMode: 'collapsible',
        fieldLayout: responsive.orientation === 'landscape' ? 'two-column' : 'single',
        spacing: 'md',
        headerCompact: false,
        footerSticky: true
      };
    }

    return {
      className: 'inset-4 w-auto h-auto max-w-[calc(100vw-32px)] max-h-[calc(100vh-32px)] rounded-xl',
      showSidebar: true,
      sidebarMode: 'persistent',
      fieldLayout: 'auto',
      spacing: 'lg',
      headerCompact: false,
      footerSticky: false
    };
  };

  const getFieldLayoutColumns = () => {
    if (responsive.isMobile) return 1;
    if (responsive.isTablet && responsive.orientation === 'portrait') return 1;
    if (responsive.isTablet && responsive.orientation === 'landscape') return 2;
    if (responsive.isDesktop) return 2;
    return 3; // wide screens
  };

  const getSidebarWidth = () => {
    if (responsive.isMobile) return 'w-full';
    if (responsive.isTablet) return 'w-72';
    if (responsive.isDesktop) return 'w-80 xl:w-96';
    return 'w-96'; // wide screens
  };

  const getContentPadding = () => {
    if (responsive.isMobile) return 'p-4';
    if (responsive.isTablet) return 'p-6';
    return 'p-8 lg:p-12';
  };

  const getHeaderHeight = () => {
    if (responsive.isMobile) return 'h-14';
    if (responsive.isTablet) return 'h-16';
    return 'h-16 lg:h-20';
  };

  const shouldUseOverlay = () => {
    return responsive.isMobile || (responsive.isTablet && responsive.orientation === 'portrait');
  };

  const getTabLayout = () => {
    if (responsive.isMobile) return 'grid grid-cols-2 gap-1';
    if (responsive.isTablet) return 'grid grid-cols-3 gap-2';
    return 'grid grid-cols-5 gap-0';
  };

  const getTitleClasses = () => {
    const baseClasses = 'font-semibold truncate';
    if (responsive.isMobile) return `${baseClasses} text-lg max-w-[200px]`;
    if (responsive.isTablet) return `${baseClasses} text-xl max-w-[300px]`;
    return `${baseClasses} text-2xl max-w-[400px]`;
  };

  const getDescriptionClasses = () => {
    const baseClasses = 'text-muted-foreground line-clamp-2';
    if (responsive.isMobile) return `${baseClasses} text-sm max-w-[250px]`;
    if (responsive.isTablet) return `${baseClasses} text-base max-w-[350px]`;
    return `${baseClasses} text-base max-w-[500px]`;
  };

  return {
    responsive,
    modalConfig: getModalConfig(),
    fieldLayoutColumns: getFieldLayoutColumns(),
    sidebarWidth: getSidebarWidth(),
    contentPadding: getContentPadding(),
    headerHeight: getHeaderHeight(),
    shouldUseOverlay: shouldUseOverlay(),
    tabLayout: getTabLayout(),
    titleClasses: getTitleClasses(),
    descriptionClasses: getDescriptionClasses()
  };
};